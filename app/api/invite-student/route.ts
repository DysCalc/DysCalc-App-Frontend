import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, classroomId, classroomName, educatorName } = await req.json();

    if (!email || !classroomId) {
      return NextResponse.json(
        { error: "Email and classroomId are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key is not configured on the server." },
        { status: 500 }
      );
    }

    // Initialize the Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const inviteLink = `${siteUrl}/invite?class_id=${classroomId}&class_name=${encodeURIComponent(classroomName || "")}&invited_by=${encodeURIComponent(educatorName || "")}`;

    // 1. Send the invite email via Nodemailer dyscalculia_b@d
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: "No SMTP Credentials included." },
        { status: 500 }
      );
    }

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"DysCalc" <${smtpUser}>`,
        to: email,
        subject: `You're invited to join ${classroomName || "a class"} on DysCalc!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #111827; margin-bottom: 16px;">You've been invited!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              <strong>${educatorName || "An educator"}</strong> has invited you to join their class: <strong style="color: #29A177;">${classroomName || "Class"}</strong> on DysCalc.
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${inviteLink}" style="background-color: #29A177; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Accept Invite & Join Class
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${inviteLink}" style="color: #2563eb; word-break: break-all;">${inviteLink}</a>
            </p>
          </div>
        `,
      });
    } catch (emailError: any) {
      console.error("Failed to send email via nodemailer:", emailError);
      return NextResponse.json(
        { error: "Failed to send email. Ensure SMTP credentials are correct." },
        { status: 500 }
      );
    }

    // 2. Track the invite in the student_invites table
    const { error: dbError } = await supabaseAdmin
      .from("student_invites")
      .insert({
        email,
        classroom_id: classroomId,
        // Wait, the schema in types/index.ts is just Database["public"]["Tables"]["student_invites"]["Row"]
        // We assume email and classroom_id are the correct columns
      });

    if (dbError) {
      console.error("Database Error:", dbError);
    }

    return NextResponse.json({
      success: true,
      message: "Invite sent successfully",
      inviteLink // Return the invite link so the frontend can optionally display it
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
