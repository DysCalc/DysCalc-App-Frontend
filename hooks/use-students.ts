import type {
    Classroom,
    TestResult,
    Student,
    StudentClassroomProfile,
    StudentInvite
} from "@/types";
import { handleReturnError, type ApiResult } from "./utils";

export type PendingInvite = StudentInvite & {
    inviteLink: string;
}

export function createStudentAPI() {
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
        async getLatestInitialTestResult(classroomId: Classroom['id'], studentId: Student['id']): Promise<ApiResult<TestResult | null>> {
            try {
                const response = await fetch(`/api/classrooms/${classroomId}/students/${studentId}/tests_results`);

                const result = await response.json();

                if (!response.ok) return handleReturnError(result.error || "Failed to get latest initial test result");

                return { success: true, data: result.data as TestResult | null };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        // async getInitialTestClassification(
        //     testId: InitialTestResult['id']
        // ): Promise<ApiResult<Pick<InitialTestClassification, 'classification' | 'prompt'> | null>> {
        //     try {
        //         const { data, error } = await supabase
        //             .from("initial_test_classification")
        //             .select("classification,prompt")
        //             .eq("test_id", testId)
        //             .maybeSingle();

        //         if (error) {
        //             return handleReturnError(error);
        //         }

        //         return {
        //             success: true,
        //             data: data as Pick<InitialTestClassification, 'classification' | 'prompt'> | null,
        //         };
        //     } catch (error) {
        //         return handleReturnError(error);
        //     }
        // }
    }
}