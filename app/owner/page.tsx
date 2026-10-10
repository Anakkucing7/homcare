import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "../../components/sign-out-button";
import { Icon } from "../../components/icons";
import { OwnerProfileForm } from "../../components/owner-profile-form";
import { createClient } from "../../lib/supabase/server";
import { isSupabaseConfigured } from "../../lib/supabase/config";

export default async function OwnerPage() {
  if (!isSupabaseConfigured) redirect("/masuk");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/masuk");
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", claims.sub).maybeSingle();
  if (profile?.role !== "owner") redirect("/akun");

  return <main className="account-page"><section className="account-card">
    <Link className="auth-brand" href="/"><span className="brand-mark"><Icon name="heart" /></span><span className="brand-name">Layanan <b>Homecare</b></span></Link>
    <p className="section-kicker">Ruang owner</p><h1>Halo, {profile.full_name || "Owner"}.</h1>
    <p className="auth-description">Akun owner Anda aktif. Ubah nama tampilan yang digunakan di akun dan reservasi.</p>
    <OwnerProfileForm initialName={profile.full_name} />
    <SignOutButton />
  </section></main>;
}
