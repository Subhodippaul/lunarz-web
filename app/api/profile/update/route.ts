import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user in database
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (name) updateData.display_name = name;
    if (email) updateData.email = email;

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
