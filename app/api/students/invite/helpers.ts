import type { Classroom, StudentInvite } from "@/types";
import nodemailer from "nodemailer";
import { createServer } from "@/lib/supabase-server";

export function buildInviteLink(
  siteUrl: string,
  classroomId: StudentInvite['classroom_id'],
  classroomName: Classroom['name'],
  educatorName: string,
  email: StudentInvite['email']
) {
  return `${siteUrl}/invite?class_id=${classroomId}&class_name=${encodeURIComponent(
    classroomName || ""
  )}&invited_by=${encodeURIComponent(educatorName || "")}&invite_email=${encodeURIComponent(
    email
  )}`;
}

export async function sendInviteEmail(args: {
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


export async function requireAuthenticatedEducator(classroomId: Classroom['id'], educator_id: Classroom['educator_id']) {
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
    .eq("educator_id", educator_id)
    .maybeSingle();

  if (error) {
    return { error: error.message, status: 400 as const, user, classroom: null };
  }

  if (!classroom) {
    return { error: "Classroom not found", status: 404 as const, user, classroom: null };
  }

  return { error: null, status: 200 as const, user, classroom };
}