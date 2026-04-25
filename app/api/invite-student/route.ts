import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createServer } from "@/lib/supabase-server";
import { StudentInvite } from "@/types";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function buildInviteLink(
  siteUrl: string,
  classroomId: string,
  classroomName: string,
  educatorName: string,
  email: string
) {
  return `${siteUrl}/invite?class_id=${classroomId}&class_name=${encodeURIComponent(
    classroomName || ""
  )}&invited_by=${encodeURIComponent(educatorName || "")}&invite_email=${encodeURIComponent(
    email
  )}`;
}

async function sendInviteEmail(args: {
  email: string;
  classroomName: string;
  educatorName: string;
  inviteLink: string;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error("No SMTP Credentials included.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  console.log("Invite Link:", args.inviteLink)

  await transporter.sendMail({
    from: `"DysCalc" <${smtpUser}>`,
    to: args.email,
    subject: `You're invited to join ${args.classroomName || "a class"} on DysCalc!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #111827; margin-bottom: 16px;">You've been invited!</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
          <strong>${args.educatorName || "An educator"}</strong> has invited you to join their class: <strong style="color: #29A177;">${args.classroomName || "Class"}</strong> on DysCalc.
        </p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${args.inviteLink}" style="background-color: #29A177; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Accept Invite & Join Class
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${args.inviteLink}" style="color: #2563eb; word-break: break-all;">${args.inviteLink}</a>
        </p>
      </div>
    `,
  });
}

async function requireAuthenticatedEducator(classroomId: string) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 as const, user: null, classroom: null };
  }

  const { data: classroom, error } = await supabase
    .from("classrooms")
    .select("id,name,educator_id")
    .eq("id", classroomId)
    .eq("educator_id", user.id)
    .maybeSingle();

  if (error) {
    return { error: error.message, status: 400 as const, user, classroom: null };
  }

  if (!classroom) {
    return { error: "Classroom not found", status: 404 as const, user, classroom: null };
  }

  return { error: null, status: 200 as const, user, classroom };
}

export async function GET(req: NextRequest) {
  try {
    const classroomId = req.nextUrl.searchParams.get("classroomId");

    if (!classroomId) {
      return NextResponse.json({ error: "classroomId is required" }, { status: 400 });
    }

    const access = await requireAuthenticatedEducator(classroomId);
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const supabaseAdmin = getAdminClient();
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
    const { email, classroomId, classroomName, educatorName } = await req.json();

    if (!email || !classroomId) {
      return NextResponse.json(
        { error: "Email and classroomId are required" },
        { status: 400 }
      );
    }

    const access = await requireAuthenticatedEducator(classroomId);
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const supabaseAdmin = getAdminClient();
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
    const { email, classroomId, classroomName, educatorName } = await req.json();

    if (!email || !classroomId) {
      return NextResponse.json({ error: "Email and classroomId are required" }, { status: 400 });
    }

    const access = await requireAuthenticatedEducator(classroomId);
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const supabaseAdmin = getAdminClient();
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
    const { email, classroomId } = await req.json();

    if (!email || !classroomId) {
      return NextResponse.json({ error: "Email and classroomId are required" }, { status: 400 });
    }

    const access = await requireAuthenticatedEducator(classroomId);
    if (access.error) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const supabaseAdmin = getAdminClient();
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

    const supabaseAdmin = getAdminClient();
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
      .update({ is_accepted: true })
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
