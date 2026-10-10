"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { Icon } from "./icons";

export function PasswordResetForm({ configured }: { configured: boolean }) {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    let active = true;
    createClient().auth.getUser()
      .then(({ data, error }) => {
        if (!active) return;
        setHasSession(!error && Boolean(data.user));
      })
      .catch(() => { if (active) setHasSession(false); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (password !== data.get("confirmPassword")) {
      setBusy(false);
      return setNotice("Kata sandi dan konfirmasi belum sama.");
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setBusy(false);
      return setNotice(error.message);
    }
    await supabase.auth.signOut();
    setComplete(true);
    setBusy(false);
  }

  return <main className="auth-page">
    <section className="auth-card" aria-labelledby="reset-title">
      <Link className="auth-brand" href="/"><span className="brand-mark"><Icon name="heart" /></span><span className="brand-name">Layanan <b>Homecare</b></span></Link>
      <p className="section-kicker">Keamanan akun</p>
      <h1 id="reset-title">{complete ? "Kata sandi berhasil diubah." : "Buat kata sandi baru."}</h1>
      <p className="auth-description">{complete ? "Silakan masuk kembali menggunakan kata sandi baru Anda." : "Gunakan minimal 8 karakter dan pastikan kedua kolom sama."}</p>
      {!configured ? <div className="auth-setup-note"><b>Project Supabase belum tersambung.</b><span>Coba lagi setelah koneksi Supabase dikonfigurasi.</span></div> : !ready ? <p className="auth-notice" role="status">Memeriksa tautan reset…</p> : complete ? <Link className="button button-primary auth-submit" href="/masuk">Kembali ke masuk <Icon name="arrow" /></Link> : !hasSession ? <p className="auth-notice" role="status">Tautan reset tidak valid atau sudah kedaluwarsa. Kembali ke masuk untuk meminta tautan baru.</p> : <form className="auth-form" onSubmit={submit}>
        <label>Kata sandi baru<input name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="Minimal 8 karakter" /></label>
        <label>Ulangi kata sandi<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} placeholder="Ketik ulang kata sandi" /></label>
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        <button className="button button-primary auth-submit" disabled={busy} type="submit">{busy ? "Menyimpan…" : "Simpan kata sandi baru"}<Icon name="arrow" /></button>
      </form>}
      {!complete && <p className="auth-switch-copy"><Link href="/masuk">Kembali ke masuk</Link></p>}
    </section>
  </main>;
}
