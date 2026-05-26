import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: "Server config error" },
                { status: 500 }
            );
        }

        const { userId } = await params;
        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId" },
                { status: 400 }
            );
        }

        // AUTH CHECK - verify they are deleting themselves, or they are an admin
        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const isDeletingSelf = user.id === userId;
        const isAdmin = user.user_metadata?.role?.toUpperCase() === 'ADMIN';

        if (!isDeletingSelf && !isAdmin) {
            return NextResponse.json(
                { error: "Forbidden: You can only delete your own profile." },
                { status: 403 }
            );
        }

        // Permanently delete the user from auth.users (cascades to profiles, educator, students)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            return NextResponse.json(
                { error: deleteError.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
