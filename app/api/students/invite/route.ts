import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import type { StudentInvite } from "@/types";
import { buildInviteLink, sendInviteEmail, requireAuthenticatedEducator } from "./helpers"


export async function GET(req: NextRequest) {
  try {
    const classroomId = req.nextUrl.searchParams.get("classroomId");
    const educator_id = req.nextUrl.searchParams.get("educator_id");
    if (!classroomId || !educator_id) {
      return NextResponse.json({ error: "classroomId and educator_id are required" }, { status: 400 });
    }

    const access = await requireAuthenticatedEducator(classroomId, educator_id);
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("student_invites")
      .select("classroom_id,email,invited_at,is_accepted")
      .eq("classroom_id", classroomId)
      .eq("is_accepted", false)
      .order("invited_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const invites = ((data ?? []) as StudentInvite[]).map((invite) => ({
      ...invite,
      inviteLink: buildInviteLink(
        siteUrl,
        invite.classroom_id,
        access.classroom?.name ?? "",
        (access.user?.user_metadata?.full_name as string) || access.user?.email || "Educator",
        invite.email
      ),
    }));

    return NextResponse.json({ success: true, data: invites });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, classroomId, classroomName, educatorName, educator_id } = await req.json();

    if (!email || !classroomId || !educator_id) {
      return NextResponse.json(
        { error: "Email and classroomId and educator_id are required" },
        { status: 400 }
      );
    }

    const access = await requireAuthenticatedEducator(classroomId, educator_id);
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service role key is not configured on the server." },
        { status: 500 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const displayClassroomName = classroomName || access.classroom?.name || "Class";
    const displayEducatorName =
      educatorName ||
      ((access.user?.user_metadata?.full_name as string) || access.user?.email || "An educator");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const inviteLink = buildInviteLink(
      siteUrl,
      classroomId,
      displayClassroomName,
      displayEducatorName,
      normalizedEmail
    );

    await sendInviteEmail({
      email: normalizedEmail,
      classroomName: displayClassroomName,
      educatorName: displayEducatorName,
      inviteLink,
    });

    const { error: dbError } = await supabaseAdmin.from("student_invites").upsert(
      {
        email: normalizedEmail,
        classroom_id: classroomId,
        is_accepted: false,
        invited_at: new Date().toISOString(),
      },
      { onConflict: "classroom_id,email" }
    );

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Invite sent successfully",
      inviteLink,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { email, classroomId, classroomName, educatorName, educator_id } = await req.json();

    if (!email || !classroomId || !educator_id) {
      return NextResponse.json({ error: "Email and classroomId and educator_id are required" }, { status: 400 });
    }

    const access = await requireAuthenticatedEducator(classroomId, educator_id);
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const displayClassroomName = classroomName || access.classroom?.name || "Class";
    const displayEducatorName =
      educatorName ||
      ((access.user?.user_metadata?.full_name as string) || access.user?.email || "An educator");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const inviteLink = buildInviteLink(
      siteUrl,
      classroomId,
      displayClassroomName,
      displayEducatorName,
      normalizedEmail
    );

    await sendInviteEmail({
      email: normalizedEmail,
      classroomName: displayClassroomName,
      educatorName: displayEducatorName,
      inviteLink,
    });

    const { error: updateError } = await supabaseAdmin
      .from("student_invites")
      .update({ invited_at: new Date().toISOString(), is_accepted: false })
      .eq("classroom_id", classroomId)
      .eq("email", normalizedEmail);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, inviteLink });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { email, classroomId, educator_id } = await req.json();

    if (!email || !classroomId || !educator_id) {
      return NextResponse.json({ error: "Email and classroomId and educator_id are required" }, { status: 400 });
    }

    const access = await requireAuthenticatedEducator(classroomId, educator_id);
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { error } = await supabaseAdmin
      .from("student_invites")
      .delete()
      .eq("classroom_id", classroomId)
      .eq("email", normalizedEmail)
      .eq("is_accepted", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { classroomId, email } = await req.json();

    if (!classroomId) {
      return NextResponse.json({ error: "classroomId is required" }, { status: 400 });
    }

    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestedEmail = String(email || user.email || "").trim().toLowerCase();
    const loggedEmail = String(user.email || "").trim().toLowerCase();

    if (!requestedEmail || requestedEmail !== loggedEmail) {
      return NextResponse.json({ error: "Invite email does not match your account" }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("student_invites")
      .select("classroom_id,email,is_accepted")
      .eq("classroom_id", classroomId)
      .eq("email", requestedEmail)
      .maybeSingle();

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    if (!invite || invite.is_accepted) {
      return NextResponse.json({ error: "Invite is no longer valid" }, { status: 410 });
    }

    const { error: studentError } = await supabaseAdmin
      .from("students")
      .upsert(
        {
          id: user.id,
          classroom_id: classroomId,
          accepted: true,
        },
        { onConflict: "id,classroom_id" }
      );

    if (studentError) {
      return NextResponse.json({ error: studentError.message }, { status: 400 });
    }

    const { error: acceptedError } = await supabaseAdmin
      .from("student_invites")
      .update({ is_accepted: true, joined_at: new Date().toISOString() })
      .eq("classroom_id", classroomId)
      .eq("email", requestedEmail);

    if (acceptedError) {
      return NextResponse.json({ error: acceptedError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
