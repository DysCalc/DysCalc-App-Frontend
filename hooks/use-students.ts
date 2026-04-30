import type {
    Classroom,
    InitialTestClassification,
    InitialTestResult,
    Student,
    StudentClassroomProfile,
    StudentInvite
} from "@/types";
import { handleReturnError, type ApiResult } from "./utils";
import { SupabaseClient } from "@supabase/supabase-js";

export type PendingInvite = StudentInvite & {
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
            educatorName: string,
            educator_id: Classroom['educator_id']
        ): Promise<ApiResult<string>> {
            try {
                const response = await fetch("/api/students/invite", {
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
                const response = await fetch(`/api/students/invite?classroomId=${encodeURIComponent(classroomId)}&educator_id=${encodeURIComponent(educator_id)}`);
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
                const response = await fetch("/api/students/invite", {
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
                const response = await fetch("/api/students/invite", {
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
                const response = await fetch("/api/students/invite", {
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
        async getClassroomStudents(classroom_id: Classroom['id']): Promise<ApiResult<StudentClassroomProfile[]>> {
            try {
                const response = await fetch(`/api/classrooms/${classroom_id}/students`);

                const result = await response.json();

                if (!response.ok) return handleReturnError(result.error || "Failed to get list of students");

                return { success: true, data: result.data };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async getClassroomStudent(classroom_id: Classroom['id'], student_id: Student['id']): Promise<ApiResult<StudentClassroomProfile>> {
            try {
                const response = await fetch(`/api/classrooms/${classroom_id}/students/${student_id}`);

                const result = await response.json();

                if (!response.ok) return handleReturnError(result.error || "Failed to get student details");

                return { success: true, data: result.data };
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