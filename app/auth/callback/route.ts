import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { isSupabaseConfigured } from "../../../lib/supabase/config";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedPath = request.nextUrl.searchParams.get("next");
  const next = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/reservasi";
  if (code && isSupabaseConfigured) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL("/masuk?status=confirmation-error", request.url));
}
