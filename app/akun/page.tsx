import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "../../components/icons";
import { PatientProfileForm } from "../../components/patient-profile-form";
import { SignOutButton } from "../../components/sign-out-button";
import { createClient } from "../../lib/supabase/server";
import { isSupabaseConfigured } from "../../lib/supabase/config";

export default async function AccountPage() {
  if (!isSupabaseConfigured) redirect("/masuk");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/masuk");
  const { data: profile } = await supabase.from("profiles").select("full_name, phone, role").eq("id", claims.sub).maybeSingle();
  if (profile?.role === "owner") redirect("/owner");
  const { data: addressProfile, error: addressError } = await supabase.from("profiles").select("address").eq("id", claims.sub).maybeSingle();

  return <main className="account-page"><section className="account-card">
    <Link className="auth-brand" href="/"><span className="brand-mark"><Icon name="heart" /></span><span className="brand-name">Layanan <b>Homecare</b></span></Link>
    <p className="section-kicker">Akun pasien</p><h1>Halo{profile?.full_name ? `, ${profile.full_name}` : ""}.</h1>
    {profile ? <><p className="auth-description">Lengkapi data agar nama, WhatsApp, dan alamat terisi otomatis saat reservasi.</p><dl className="account-details"><div><dt>Email</dt><dd>{String(claims.email ?? "")}</dd></div></dl><PatientProfileForm initialName={profile.full_name} initialPhone={profile.phone} initialAddress={addressProfile?.address ?? ""} schemaReady={!addressError} /></> : <p className="auth-description">Profil belum tersedia. Pastikan langkah SQL Supabase sudah dijalankan.</p>}
    <SignOutButton /> <Link className="text-link" href="/reservasi"><Icon name="arrow" /> Pilih layanan</Link>
  </section></main>;
}
