import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — gives access to auth.users + bypasses RLS on public.users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Fetch ALL users from Supabase Auth (the source of truth)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authError) {
      console.error("Error fetching auth users:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 2. Fetch is_admin flags from public.users (keyed by id)
    const { data: profileRows } = await supabaseAdmin
      .from("users")
      .select("id, is_admin, display_name, provider");

    const profileMap = new Map(
      (profileRows || []).map((p) => [p.id, p])
    );

    // 3. Merge: auth user data + is_admin from public.users
    const users = (authData.users || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((authUser) => {
        const profile = profileMap.get(authUser.id);
        const provider =
          profile?.provider ||
          authUser.app_metadata?.provider ||
          (authUser.identities?.[0]?.provider ?? "email");

        const displayName =
          profile?.display_name ||
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.display_name ||
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          "Unknown";

        return {
          id: authUser.id,
          uid: authUser.id,
          email: authUser.email ?? "",
          name: displayName,
          provider: provider === "google" ? "google" : "email",
          isAdmin: profile?.is_admin ?? false,
          // Whether a public.users profile row exists
          hasProfile: !!profile,
          createdAt: authUser.created_at,
          lastSignIn: authUser.last_sign_in_at ?? null,
        };
      });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Get all users route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
