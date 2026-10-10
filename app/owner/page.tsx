import { redirect } from "next/navigation";
import { OwnerDashboard } from "../../components/owner-dashboard";
import { createClient } from "../../lib/supabase/server";
import { isSupabaseConfigured } from "../../lib/supabase/config";

export default async function OwnerPage() {
  if (!isSupabaseConfigured) redirect("/masuk");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/masuk");
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", claims.sub).maybeSingle();
  if (profile?.role !== "owner") redirect("/reservasi");

  return <OwnerDashboard initialName={profile.full_name} />;
}
