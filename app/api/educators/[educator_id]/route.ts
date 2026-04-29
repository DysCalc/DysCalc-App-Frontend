// For specific educator operations

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServer } from "@/lib/supabase-server";
/**
 * GET (already implemented)
 */
export async function GET(req: NextRequest,
    { params }: { params: Promise<{ educator_id: string }> }): Promise<NextResponse> {
    try {
        const educator_id = (await params).educator_id;
        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server config error" }, { status: 500 });
        }

        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: { user: educator }, error: educatorError } = await supabaseAdmin.auth.admin.getUserById(educator_id);

        if (!educator || educatorError) {
            return NextResponse.json({ error: educatorError?.message || "Educator not found" }, { status: educatorError?.status || 404 });
        }

        const educatorInfo = {
            id: educator.id,
            email: educator.email,
            full_name: educator.user_metadata.full_name,
            avatar_url: educator.user_metadata.avatar_url,
        };

        const { data: educatorProfile, error: profileError } = await supabaseAdmin
            .from("educator")
            .select(`
                license_id, 
                workplace_name,
                workplace_address,
                undergrad,
                masters,
                doctorate,
                profiles!inner(
                    created_at,
                    sex,
                    date_of_birth,
                    nickname
                )
            `)
            .eq("id", educatorInfo.id)
            .single();

        if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 400 });
        }

        const { profiles, ...restProfile } = educatorProfile;

        const educatorData = {
            ...educatorInfo,
            ...restProfile,
            ...profiles[0],
        };

        return NextResponse.json({ success: true, data: educatorData });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST → Create educator (educators + profiles)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ educator_id: string }> }
): Promise<NextResponse> {
    try {
        const educator_id = (await params).educator_id;
        const body = await req.json();

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: "Server config error" },
                { status: 500 }
            );
        }

        // AUTH CHECK
        const { data: { user }, error: userError } =
            await supabaseServer.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const {
            license_id,
            workplace_name,
            workplace_address,
            undergrad,
            masters,
            doctorate,
            sex,
            date_of_birth,
            nickname,
            full_name,
            avatar_url,
        } = body;

        await supabaseAdmin.auth.admin.updateUserById(educator_id, {
            user_metadata: { full_name, avatar_url },
        });

        const { error: educatorError } =
            await supabaseAdmin.rpc("create_educator_with_profile", {
                p_id: educator_id,
                p_license_id: license_id,
                p_workplace_name: workplace_name,
                p_workplace_address: workplace_address,
                p_undergrad: undergrad,
                p_masters: masters,
                p_doctorate: doctorate,
                p_sex: sex,
                p_date_of_birth: date_of_birth,
                p_nickname: nickname,
            });

        if (educatorError) {
            return NextResponse.json(
                { error: educatorError.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Internal server error";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * PUT → Update educator + profile + auth metadata
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ educator_id: string }> }
): Promise<NextResponse> {
    try {
        const educator_id = (await params).educator_id;
        const body = await req.json();

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: "Server config error" },
                { status: 500 }
            );
        }

        // AUTH CHECK
        const { data: { user }, error: userError } =
            await supabaseServer.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const {
            full_name,
            avatar_url,
            license_id,
            workplace_name,
            workplace_address,
            undergrad,
            masters,
            doctorate,
            sex,
            date_of_birth,
            nickname,
        } = body;

        await supabaseAdmin.auth.admin.updateUserById(educator_id, {
            user_metadata: {
                full_name,
                avatar_url,
            },
        });

        const { error: educatorError } =
            await supabaseAdmin.rpc("update_educator_with_profile", {
                p_id: educator_id,
                p_license_id: license_id,
                p_workplace_name: workplace_name,
                p_workplace_address: workplace_address,
                p_undergrad: undergrad,
                p_masters: masters,
                p_doctorate: doctorate,
                p_sex: sex,
                p_date_of_birth: date_of_birth,
                p_nickname: nickname,
            });

        if (educatorError) {
            return NextResponse.json(
                { error: educatorError.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Internal server error";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * DELETE → Remove educator (and profile)
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ educator_id: string }> }
): Promise<NextResponse> {
    try {
        const educator_id = (await params).educator_id;

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: "Server config error" },
                { status: 500 }
            );
        }

        // AUTH CHECK
        const { data: { user }, error: userError } =
            await supabaseServer.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { error: deleteError } =
            await supabaseAdmin.rpc("delete_educator_with_profile", {
                p_id: educator_id,
            });

        if (deleteError) {
            console.log("Delete Educator error:", deleteError)
            return NextResponse.json(
                { error: deleteError.message },
                { status: 400 }
            );
        }

        const { error: authDeleteError } =
            await supabaseAdmin.auth.admin.deleteUser(educator_id);

        if (authDeleteError) {
            return NextResponse.json(
                { error: authDeleteError.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Internal server error";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}