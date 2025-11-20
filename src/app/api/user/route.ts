import { NextResponse } from "next/server";
import { createServerClientWrapper } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerClientWrapper();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user }, { status: 200 });
}