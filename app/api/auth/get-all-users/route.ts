import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS completely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, email, display_name, is_admin, provider, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = (data || []).map((user) => ({
      id: user.id,
      uid: user.id,
      email: user.email,
      name: user.display_name || user.email?.split("@")[0] || "Unknown",
      provider: user.provider || "email",
      isAdmin: user.is_admin || false,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Get all users route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
