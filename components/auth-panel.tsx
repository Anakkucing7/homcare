"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { Icon } from "./icons";

export function AuthPanel({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<"user" | "owner">("user");
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    setBusy(true);
    setNotice("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const supabase = createClient();

    if (registering) {
      const fullName = String(data.get("name") ?? "").trim();
      const phone = String(data.get("phone") ?? "").replace(/[\s()-]/g, "");
      if (!/^(?:\+?62|0)8\d{7,11}$/.test(phone)) {
        setBusy(false);
        return setNotice("Masukkan nomor WhatsApp Indonesia yang valid, misalnya 081234567890.");
      }
      const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/akun`,
        },
      });
      setBusy(false);
      if (error) return setNotice(error.message);
      if (!result.session) return setNotice("Akun dibuat. Periksa email Anda untuk mengonfirmasi akun sebelum masuk.");
      router.replace("/akun");
      router.refresh();
      return;
    }

    const { data: result, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setBusy(false); return setNotice("Email atau kata sandi tidak cocok."); }
    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", result.user.id).maybeSingle();
    if (profileError || !profile) {
      await supabase.auth.signOut();
      setBusy(false);
      return setNotice("Profil belum siap. Pastikan supabase/schema.sql sudah dijalankan.");
    }
    if (role === "owner" && profile.role !== "owner") {
      await supabase.auth.signOut();
      setBusy(false);
      return setNotice("Akun ini belum memiliki akses owner. Hubungi pemilik project.");
    }
    setBusy(false);
    router.replace(profile.role === "owner" ? "/owner" : "/akun");
    router.refresh();
  }

  return <main className="auth-page">
    <section className="auth-card" aria-labelledby="auth-title">
      <Link className="auth-brand" href="/"><span className="brand-mark"><Icon name="heart" /></span><span className="brand-name">Layanan <b>Homecare</b></span></Link>
      <p className="section-kicker">Akun Homecare</p>
      <h1 id="auth-title">{registering ? "Buat akun pasien." : role === "owner" ? "Masuk sebagai owner." : "Selamat datang kembali."}</h1>
      <p className="auth-description">{registering ? "Simpan data kontak Anda untuk reservasi berikutnya." : role === "owner" ? "Masuk dengan akun owner yang telah diaktifkan." : "Masuk untuk mengisi data reservasi secara otomatis."}</p>
      <div className="auth-role-switch" aria-label="Jenis akun">
        <button type="button" className={role === "user" ? "active" : ""} aria-pressed={role === "user"} onClick={() => { setRole("user"); setRegistering(false); setNotice(""); }}>Pasien</button>
        <button type="button" className={role === "owner" ? "active" : ""} aria-pressed={role === "owner"} onClick={() => { setRole("owner"); setRegistering(false); setNotice(""); }}>Owner</button>
      </div>
      {!configured ? <div className="auth-setup-note"><b>Project Supabase belum tersambung.</b><span>Buat project, isi URL dan publishable key di file lokal <code>.env.local</code>, lalu jalankan langkah SQL pada panduan setup.</span></div> : <form className="auth-form" onSubmit={submit}>
        {registering && role === "user" && <label>Nama lengkap<input name="name" autoComplete="name" required maxLength={100} placeholder="Nama Anda" /></label>}
        {registering && role === "user" && <label>Nomor WhatsApp<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="0812 3456 7890" /></label>}
        <label>Email<input name="email" type="email" autoComplete="email" required placeholder="nama@email.com" /></label>
        <label>Kata sandi<input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} required minLength={8} placeholder="Minimal 8 karakter" /></label>
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        <button className="button button-primary auth-submit" disabled={busy} type="submit">{busy ? "Memproses…" : registering ? "Buat akun" : "Masuk"}<Icon name="arrow" /></button>
      </form>}
      {configured && role === "user" && <p className="auth-switch-copy">{registering ? "Sudah punya akun?" : "Belum punya akun?"} <button type="button" onClick={() => { setRegistering(!registering); setNotice(""); }}>{registering ? "Masuk" : "Daftar gratis"}</button></p>}
      {role === "owner" && <p className="auth-owner-note">Akses owner hanya diberikan oleh pemilik project.</p>}
      <Link className="auth-guest-link" href="/reservasi">Lanjut reservasi tanpa akun <Icon name="arrow" /></Link>
    </section>
  </main>;
}
