"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { Icon } from "./icons";

export function AuthPanel({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/reservasi`,
        },
      });
      setBusy(false);
      if (error) return setNotice(error.message);
      if (!result.session) return setNotice("Akun dibuat. Periksa email Anda untuk mengonfirmasi akun sebelum masuk.");
      router.replace("/reservasi");
      router.refresh();
      return;
    }

    if (resetting) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/atur-kata-sandi`,
      });
      setBusy(false);
      const message = error?.message.toLowerCase().includes("rate limit")
        ? "Terlalu banyak permintaan email baru-baru ini. Tunggu sekitar 1 jam sebelum meminta tautan reset lagi."
        : error?.message ?? "Tautan untuk membuat kata sandi baru telah dikirim. Periksa email Anda.";
      return setNotice(message);
    }

    const { data: result, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setBusy(false); return setNotice("Email atau kata sandi tidak cocok."); }
    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", result.user.id).maybeSingle();
    if (profileError || !profile) {
      await supabase.auth.signOut();
      setBusy(false);
      return setNotice("Profil belum siap. Pastikan supabase/schema.sql sudah dijalankan.");
    }
    setBusy(false);
    router.replace(profile.role === "owner" ? "/owner" : "/reservasi");
    router.refresh();
  }

  return <main className="auth-page"><div className="auth-layout"><aside className="auth-visual"><img src="/images/homecare-visit.jpg" alt="Perawat mendampingi pasien di rumah" /><span className="auth-visual-shade" /><div><p className="section-kicker">Perawatan lebih dekat</p><h2>Nyaman dirawat di tempat yang paling akrab.</h2><p>Pesan kunjungan homecare dengan mudah, bersama tenaga kesehatan profesional.</p></div></aside>
    <section className={`auth-card${registering ? " is-registering" : ""}`} aria-labelledby="auth-title">
      <Link className="auth-brand" href="/"><span className="brand-mark"><Icon name="heart" /></span><span className="brand-name">Layanan <b>Homecare</b></span></Link>
      <p className="section-kicker">Akun Homecare</p>
      <h1 id="auth-title">{resetting ? "Atur ulang kata sandi." : registering ? "Buat akun pasien." : "Selamat datang kembali."}</h1>
      <p className="auth-description">{resetting ? "Kami akan mengirim tautan aman ke email Anda untuk membuat kata sandi baru." : registering ? "Simpan data kontak Anda untuk reservasi berikutnya." : "Masuk menggunakan email dan kata sandi. Anda akan diarahkan sesuai jenis akun."}</p>
      {!configured ? <div className="auth-setup-note"><b>Project Supabase belum tersambung.</b><span>Buat project, isi URL dan publishable key di file lokal <code>.env.local</code>, lalu jalankan langkah SQL pada panduan setup.</span></div> : <form className="auth-form" onSubmit={submit}>
        {registering && <label>Nama lengkap<input name="name" autoComplete="name" required maxLength={100} placeholder="Nama Anda" /></label>}
        {registering && <label>Nomor WhatsApp<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="0812 3456 7890" /></label>}
        <label>Email<input name="email" type="email" autoComplete="email" required placeholder="nama@email.com" /></label>
        {!resetting && <label className="password-field">Kata sandi<input name="password" type={showPassword ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"} required minLength={8} placeholder="Minimal 8 karakter" /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-pressed={showPassword}><Icon name={showPassword ? "eyeOff" : "eye"} /></button></label>}
        {!registering && !resetting && <button className="auth-inline-link" type="button" onClick={() => { setResetting(true); setNotice(""); }}>Lupa kata sandi?</button>}
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        <button className="button button-primary auth-submit" disabled={busy} type="submit">{busy ? "Memproses…" : resetting ? "Kirim tautan reset" : registering ? "Buat akun" : "Masuk"}<Icon name="arrow" /></button>
      </form>}
      {resetting && <p className="auth-switch-copy"><button type="button" onClick={() => { setResetting(false); setNotice(""); }}>Kembali ke masuk</button></p>}
      {configured && !resetting && <p className="auth-switch-copy">{registering ? "Sudah punya akun?" : "Belum punya akun?"} <button type="button" onClick={() => { setRegistering(!registering); setNotice(""); }}>{registering ? "Masuk" : "Daftar gratis"}</button></p>}
      {!resetting && <Link className="auth-guest-link" href="/reservasi">Lanjut reservasi tanpa akun <Icon name="arrow" /></Link>}
    </section></div>
  </main>;
}
