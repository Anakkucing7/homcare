"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return <button className="button button-secondary" type="button" onClick={async () => { await createClient().auth.signOut(); router.replace("/masuk"); router.refresh(); }}>Keluar</button>;
}
