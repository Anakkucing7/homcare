"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export function OwnerProfileForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fullName = name.trim();
    if (!fullName) return setNotice("Nama tampilan wajib diisi.");

    setBusy(true);
    setNotice("");
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) {
      setBusy(false);
      return setNotice("Sesi Anda berakhir. Silakan masuk kembali.");
    }

    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", data.user.id);
    setBusy(false);
    if (error) return setNotice("Nama belum tersimpan. Silakan coba lagi.");
    setName(fullName);
    setNotice("Nama tampilan berhasil disimpan.");
    router.refresh();
  }

  return <form className="auth-form" onSubmit={saveName}>
    <label htmlFor="owner-display-name">Nama tampilan
      <input id="owner-display-name" name="full_name" autoComplete="name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
    </label>
    {notice && <p className="auth-notice" role="status">{notice}</p>}
    <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? "Menyimpan…" : "Simpan nama"}</button>
  </form>;
}
