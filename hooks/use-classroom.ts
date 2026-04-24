import { Classroom, ClassroomWithStudentCount } from "@/types";
import { handleReturnError, type ApiResult } from "./utils";
import { SupabaseClient } from "@supabase/supabase-js";

export function createClassroomAPI(supabase: SupabaseClient) {
    return {
        async createClassroom(educatorId: string, name: string): Promise<ApiResult<Classroom>> {
            try {
                const { data, error } = await supabase.from('classrooms')
                    .insert({
                        educator_id: educatorId,
                        name: name
                    })
                    .select("id,name,created_at,educator_id")
                    .single();

                if (error) {
                    return handleReturnError(error);
                }
                return { success: true, data: data as Classroom };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async getAllClassrooms(educatorId: string): Promise<ApiResult<ClassroomWithStudentCount[]>> {
            try {
                const { data, error } = await supabase
                    .from('classrooms')
                    .select(`
                        id,
                        name,
                        created_at,
                        educator_id,
                        student_count:students(count)
                    `)
                    .eq('educator_id', educatorId)
                    .eq('is_archived', false)
                    .order('created_at', { ascending: false });
                if (error) {
                    return handleReturnError(error);
                }
                // Transform the raw data to match ClassroomWithStudentCount type
                const transformedData = data?.map((item: any) => ({
                    ...item,
                    student_count: item.student_count?.[0]?.count ?? 0
                })) as ClassroomWithStudentCount[];
                return { success: true, data: transformedData };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async getClassroomById(classroomId: number): Promise<ApiResult<ClassroomWithStudentCount>> {
            try {
                const { data, error } = await supabase.from('classrooms')
                    .select("id,name,created_at,educator_id,student_count:students(count)")
                    .eq('id', classroomId)
                    .eq("is_archived", false)
                    .single();
                if (error) {
                    return handleReturnError(error);
                }
                const transformedData = { ...data, student_count: data.student_count?.[0]?.count ?? 0 } as ClassroomWithStudentCount
                return { success: true, data: transformedData }
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async deleteClassroom(classroomId: number): Promise<ApiResult<boolean>> {
            try {
                const { error } = await supabase.from('classrooms')
                    .update({ is_archived: true })
                    .eq('id', classroomId);
                if (error) {
                    return handleReturnError(error)
                }
                return { success: true, data: true };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async updateClassroomName(classroomId: number, name: string): Promise<ApiResult<ClassroomWithStudentCount>> {
            try {
                const { data, error } = await supabase.from('classrooms')
                    .update({ name: name })
                    .eq('id', classroomId)
                    .eq("is_archived", false)
                    .select("id,name,created_at,educator_id,student_count:students(count)")
                    .single();
                if (error) {
                    return handleReturnError(error);
                }
                const transformedData = { ...data, student_count: data.student_count?.[0]?.count ?? 0 } as ClassroomWithStudentCount
                return { success: true, data: transformedData };
            } catch (error) {
                return handleReturnError(error);
            }
        }
    }
}