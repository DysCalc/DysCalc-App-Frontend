import type { Classroom, StudentInvite, Student } from "@/types";
import { handleReturnError, type ApiResult } from "./utils";
import { SupabaseClient } from "@supabase/supabase-js";

export type PendingInvite = {
    classroom_id: StudentInvite['classroom_id'];
    email: StudentInvite['email'];
    invited_at: StudentInvite['invited_at'];
    is_accepted: StudentInvite['is_accepted'];
    inviteLink: string;
}

export function createStudentAPI(supabase: SupabaseClient) {
    return {
        // async emailStudent(studentId: Student['id']): Promise<ApiResult<boolean>> {
        //     try {
        //         const reciepient = 
        //         return { success: true, data: true };
        //     } catch (error) {
        //         return handleReturnError(error);
        //     }
        // },
        async inviteStudentByEmail(
            email: StudentInvite['email'],
            classroomId: StudentInvite['classroom_id'],
            classroomName: Classroom['name'],
            educatorName: Classroom['educator_id']
        ): Promise<ApiResult<string>> {
            try {
                const response = await fetch("/api/invite-student", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        classroomId,
                        classroomName,
                        educatorName,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    return { success: false, error: result.error || "Failed to invite student" };
                }

                return { success: true, data: result.inviteLink };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async getPendingInvites(classroomId: StudentInvite['classroom_id']): Promise<ApiResult<PendingInvite[]>> {
            try {
                const response = await fetch(`/api/invite-student?classroomId=${encodeURIComponent(classroomId)}`);
                const result = await response.json();

                if (!response.ok) {
                    return { success: false, error: result.error || "Failed to fetch invites" };
                }

                return { success: true, data: result.data as PendingInvite[] };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async resendInvite(
            email: StudentInvite['email'],
            classroomId: StudentInvite['classroom_id'],
            classroomName: Classroom['name'],
            educatorName: Classroom['educator_id']
        ): Promise<ApiResult<string>> {
            try {
                const response = await fetch("/api/invite-student", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, classroomId, classroomName, educatorName }),
                });

                const result = await response.json();

                if (!response.ok) {
                    return { success: false, error: result.error || "Failed to resend invite" };
                }

                return { success: true, data: result.inviteLink as string };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async removeInvite(
            email: StudentInvite['email'],
            classroomId: StudentInvite['classroom_id']
        ): Promise<ApiResult<boolean>> {
            try {
                const response = await fetch("/api/invite-student", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, classroomId }),
                });

                const result = await response.json();

                if (!response.ok) {
                    return { success: false, error: result.error || "Failed to remove invite" };
                }

                return { success: true, data: true };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async acceptInvite(classroomId: StudentInvite['classroom_id'], email?: StudentInvite['email']): Promise<ApiResult<boolean>> {
            try {
                const response = await fetch("/api/invite-student", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ classroomId, email }),
                });

                const result = await response.json();

                if (!response.ok) {
                    return { success: false, error: result.error || "Failed to accept invite" };
                }

                return { success: true, data: true };
            } catch (error) {
                return handleReturnError(error);
            }
        }
    }
}