"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export function PatientProfileForm({ initialName, initialPhone, initialAddress, schemaReady }: { initialName: string; initialPhone: string; initialAddress: string; schemaReady: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const full_name = String(form.get("full_name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").replace(/[\s()-]/g, "");
    const address = String(form.get("address") ?? "").trim();
    if (!schemaReady) return setNotice("Jalankan SQL migrasi profil pasien di Supabase sebelum menyimpan alamat.");
    if (!/^(?:\+?62|0)8\d{7,11}$/.test(phone)) return setNotice("Masukkan nomor WhatsApp Indonesia yang valid.");
    if (address.length < 8) return setNotice("Masukkan alamat lengkap agar bisa digunakan untuk reservasi.");

    setBusy(true);
    setNotice("");
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setBusy(false);
      return setNotice("Sesi Anda berakhir. Silakan masuk kembali.");
    }
    const { error } = await supabase.from("profiles").update({ full_name, phone, address }).eq("id", user.id);
    setBusy(false);
    if (error) return setNotice(error.message.includes("address") ? "Jalankan migrasi profil pasien di Supabase terlebih dahulu." : "Data akun belum tersimpan. Silakan coba lagi.");
    router.replace("/reservasi");
    router.refresh();
  }

  return <form className="auth-form patient-profile-form" onSubmit={saveProfile}>
    <label>Nama lengkap<input name="full_name" autoComplete="name" required maxLength={100} defaultValue={initialName} /></label>
    <label>Nomor WhatsApp<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required defaultValue={initialPhone} placeholder="0812 3456 7890" /></label>
    <label>Alamat lengkap<textarea name="address" autoComplete="street-address" required minLength={8} maxLength={500} rows={3} defaultValue={initialAddress} placeholder="Jalan, nomor rumah, kecamatan, kota" /></label>
    {!schemaReady && <p className="auth-notice" role="status">Sebelum melanjutkan, jalankan file <code>supabase/migrations/20261010_profile_address.sql</code> melalui SQL Editor Supabase.</p>}
    {notice && <p className="auth-notice" role="status">{notice}</p>}
    <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? "Menyimpan…" : "Simpan & pilih layanan"}</button>
  </form>;
}
