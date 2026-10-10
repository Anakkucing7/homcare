import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "../../components/sign-out-button";
import { Icon } from "../../components/icons";
import { createClient } from "../../lib/supabase/server";
import { isSupabaseConfigured } from "../../lib/supabase/config";

export default async function OwnerPage() {
  if (!isSupabaseConfigured) redirect("/masuk");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/masuk");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", claims.sub).maybeSingle();
  if (profile?.role !== "owner") redirect("/akun");

  return <main className="account-page"><section className="account-card">
    <Link className="auth-brand" href="/"><span className="brand-mark"><Icon name="heart" /></span><span className="brand-name">Layanan <b>Homecare</b></span></Link>
    <p className="section-kicker">Ruang owner</p><h1>Akses owner aktif.</h1>
    <p className="auth-description">Akun Anda sudah terverifikasi sebagai owner. Panel untuk mengelola layanan, reservasi, dan testimoni dapat ditambahkan berikutnya.</p>
    <SignOutButton />
  </section></main>;
}
