import { AuthPanel } from "../../components/auth-panel";
import { isSupabaseConfigured } from "../../lib/supabase/config";

export default function SignInPage() {
  return <AuthPanel configured={isSupabaseConfigured} />;
}
