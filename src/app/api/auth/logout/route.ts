import { createServerClientWrapper } from "@/lib/supabase/supabase-server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createServerClientWrapper();
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}