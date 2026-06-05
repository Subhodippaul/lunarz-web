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

    const { error } = await supabaseAdmin
      .from("users")
      .update({ is_admin, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating user role:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update role route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
