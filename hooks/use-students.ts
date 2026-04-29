import type { Classroom, InitialTestClassification, InitialTestResult, Student, StudentInvite } from "@/types";
import { handleReturnError, type ApiResult } from "./utils";
import { SupabaseClient } from "@supabase/supabase-js";

export type PendingInvite = {
    classroom_id: StudentInvite['classroom_id'];
    email: StudentInvite['email'];
    invited_at: StudentInvite['invited_at'];
    is_accepted: StudentInvite['is_accepted'];
    inviteLink: string;
}

type ClassroomStudentSummary = {
    id: Student['id'];
    name: string;
};

export type ClassroomStudentPayload = {
    success: boolean;
    data?: ClassroomStudentSummary;
    error?: string;
};

export type ClassroomStudentsPayload = {
    success: boolean;
    data?: ClassroomStudentSummary[];
    error?: string;
};

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
            educatorName: string,
            educator_id: Classroom['educator_id']
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
                        educator_id
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
        async getPendingInvites(classroomId: StudentInvite['classroom_id'], educator_id: Classroom['educator_id']): Promise<ApiResult<PendingInvite[]>> {
            try {
                const response = await fetch(`/api/invite-student?classroomId=${encodeURIComponent(classroomId)}&educator_id=${encodeURIComponent(educator_id)}`);
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
            educatorName: string,
            educator_id: Classroom['educator_id']
        ): Promise<ApiResult<string>> {
            try {
                const response = await fetch("/api/invite-student", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, classroomId, classroomName, educatorName, educator_id }),
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
            classroomId: StudentInvite['classroom_id'],
            educator_id: Classroom['educator_id']
        ): Promise<ApiResult<boolean>> {
            try {
                const response = await fetch("/api/invite-student", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, classroomId, educator_id }),
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
        },
        async getClassroomStudents(classroomId: Classroom['id']): Promise<ApiResult<ClassroomStudentSummary[]>> {
            try {
                const response = await supabase.functions.invoke("classroom-students", {
                    body: { classId: classroomId },
                });

                if (response.error) {
                    return handleReturnError(response.error);
                }

                const payload = response.data as ClassroomStudentsPayload;

                if (!payload?.success || !payload.data) {
                    return {
                        success: false,
                        error: payload?.error || "Failed to load students",
                    };
                }

                return { success: true, data: payload.data };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async getClassroomStudent(
            classroomId: Classroom['id'],
            studentId: Student['id']
        ): Promise<ApiResult<ClassroomStudentSummary>> {
            try {
                const response = await supabase.functions.invoke("classroom-student", {
                    body: { classId: classroomId, studentId },
                });

                if (response.error) {
                    return handleReturnError(response.error);
                }

                const payload = response.data as ClassroomStudentPayload;

                if (!payload?.success || !payload.data) {
                    return {
                        success: false,
                        error: payload?.error || "Failed to load student details",
                    };
                }

                return { success: true, data: payload.data };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async getLatestInitialTestResult(
            classroomId: Classroom['id'],
            studentId: Student['id']
        ): Promise<ApiResult<InitialTestResult | null>> {
            try {
                const { data, error } = await supabase
                    .from("initial_test_results")
                    .select(
                        "id,created_at,dot_matching,number_comparison,number_series,single_addition,single_subtraction,complex_arithmetic"
                    )
                    .eq("classroom_id", classroomId)
                    .eq("student_id", studentId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    return handleReturnError(error);
                }

                return { success: true, data: data as InitialTestResult | null };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async getInitialTestClassification(
            testId: InitialTestResult['id']
        ): Promise<ApiResult<Pick<InitialTestClassification, 'classification' | 'prompt'> | null>> {
            try {
                const { data, error } = await supabase
                    .from("initial_test_classification")
                    .select("classification,prompt")
                    .eq("test_id", testId)
                    .maybeSingle();

                if (error) {
                    return handleReturnError(error);
                }

                return {
                    success: true,
                    data: data as Pick<InitialTestClassification, 'classification' | 'prompt'> | null,
                };
            } catch (error) {
                return handleReturnError(error);
            }
        }
    }
}