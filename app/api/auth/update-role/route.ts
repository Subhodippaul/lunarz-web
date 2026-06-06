import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS completely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { id, is_admin } = await req.json();

    if (!id || typeof is_admin !== "boolean") {
      return NextResponse.json(
        { error: "id (string) and is_admin (boolean) are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Check if a profile row already exists
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (existing) {
      // Row exists — plain update, no risk of violating NOT NULL
      const { error } = await supabaseAdmin
        .from("users")
        .update({ is_admin, updated_at: now })
        .eq("id", id);

      if (error) {
        console.error("Error updating user role:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // No profile row yet (Auth-only user) — fetch their details from auth.users first
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(id);

      if (authError || !authUser?.user) {
        return NextResponse.json({ error: "User not found in auth" }, { status: 404 });
      }

      const user = authUser.user;
      const provider = user.app_metadata?.provider ?? "email";
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.display_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      const { error: insertError } = await supabaseAdmin.from("users").insert({
        id: user.id,
        email: user.email,
        display_name: displayName,
        provider: provider === "google" ? "google" : "email",
        is_admin,
        created_at: now,
        updated_at: now,
      });

      if (insertError) {
        // If duplicate key (race condition), fall back to a plain update
        if (insertError.code === "23505") {
          await supabaseAdmin
            .from("users")
            .update({ is_admin, updated_at: now })
            .eq("id", id);
        } else {
          console.error("Error creating profile for auth-only user:", insertError);
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update role route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
