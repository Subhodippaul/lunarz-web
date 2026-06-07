import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  console.log('req..............',req);

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // Exchange the OAuth code for a session using the anon client
  const { createClient: createAnonClient } = await import("@supabase/supabase-js");
  const supabaseAnon = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabaseAnon.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[auth/callback] exchangeCodeForSession error:", error);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const user = data.user;
  const provider = user.app_metadata?.provider ?? "email";

  // Only create a profile row for Google users (email/password users are handled at register time)
  if (provider === "google") {
    try {
      // Check if the user already exists in our users table
      const { data: existing } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existing) {
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";

        const { error: insertError } = await supabaseAdmin.from("users").insert({
          id: user.id,
          email: user.email,
          display_name: displayName,
          provider: "google",
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError && insertError.code !== "23505") {
          // 23505 = duplicate key, safe to ignore (race condition)
          console.error("[auth/callback] Failed to create Google user profile:", insertError);
        }
      }
    } catch (err) {
      // Non-fatal — user is still authenticated even if profile creation fails
      console.error("[auth/callback] Profile creation error:", err);
    }
  }

  // Redirect to the intended destination (or home)
  return NextResponse.redirect(`${origin}${next}`);
}
