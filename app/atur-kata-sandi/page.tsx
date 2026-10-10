import { PasswordResetForm } from "../../components/password-reset-form";
import { isSupabaseConfigured } from "../../lib/supabase/config";

export default function ResetPasswordPage() {
  return <PasswordResetForm configured={isSupabaseConfigured} />;
}
