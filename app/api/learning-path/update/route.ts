import { createServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { test_id, module_data } = body;

    if (!test_id || !module_data) {
      return NextResponse.json({ success: false, error: "Missing test_id or module_data" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("learning_modules")
      .update({ modules: module_data })
      .eq("result_id", test_id);

    if (updateError) {
      return NextResponse.json({ success: false, error: "Failed to update the module." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: module_data });

  } catch (error) {
    console.error("Update module error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
