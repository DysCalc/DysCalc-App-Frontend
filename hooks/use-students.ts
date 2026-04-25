import type { Classroom, Student, StudentInvite } from "@/types";
import { handleReturnError, type ApiResult } from "./utils";
import { SupabaseClient } from "@supabase/supabase-js";

export function createStudentAPI(supabase: SupabaseClient) {
    return {
        // async getStudentById(studentId: number): Promise<ApiResult<Student>> {
        //     try {
        //         const { data, error } = await supabase.from('students')
        //             .select("id,name,created_at,educator_id")
        //             .eq('id', studentId)
        //             .single();
        //         if (error) {
        //             return handleReturnError(error);
        //         }
        //         return { success: true, data: data as Student };
        //     } catch (error) {
        //         return handleReturnError(error);
        //     }
        // },
        // async getStudentsByClassroomId(classroomId: number): Promise<ApiResult<Student[]>> {
        //     try {
        //         const { data, error } = await supabase.from('students')
        //             .select("id,name,created_at,educator_id")
        //             .eq('classroom_id', classroomId)
        //             .eq("is_archived", false)
        //             .order('created_at', { ascending: false });
        //         if (error) {
        //             return handleReturnError(error);
        //         }
        //         return { success: true, data: data as Student[] };
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
        }
    }
}