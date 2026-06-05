import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS completely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { id, email, display_name } = await req.json();

    if (!id || !email) {
      return NextResponse.json({ error: "id and email are required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          id,
          email,
          display_name: display_name || email.split("@")[0],
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("Error creating user profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Create profile route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
