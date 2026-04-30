import type { Classroom, ClassroomWithStudentCount } from "@/types";
import { handleReturnError, type ApiResult } from "./utils";

export function createClassroomAPI() {
    return {
        async createClassroom(educator_id: Classroom['educator_id'], name: Classroom['name']): Promise<ApiResult<Classroom>> {
            try {
                const res = await fetch("/api/classrooms", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        educator_id,
                        name,
                    }),
                });

                const json = await res.json();

                if (!res.ok) return handleReturnError(json.error || "Failed to create classroom");

                return { success: true, data: json.data as Classroom };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async getAllClassrooms(educator_id: Classroom['educator_id']): Promise<ApiResult<ClassroomWithStudentCount[]>> {
            try {
                const res = await fetch(`/api/classrooms?educator_id=${educator_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                const json = await res.json();

                if (!res.ok) return handleReturnError(json.error || "Failed to get all classrooms");

                return { success: true, data: json.data as ClassroomWithStudentCount[] };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async getClassroomById(classroom_id: Classroom['id']): Promise<ApiResult<ClassroomWithStudentCount>> {
            try {
                const res = await fetch(`/api/classrooms/${classroom_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                const json = await res.json();

                if (!res.ok) return handleReturnError(json.error || "Failed to get classroom by ID");

                return { success: true, data: json.data as ClassroomWithStudentCount };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async deleteClassroom(classroom_id: Classroom['id']): Promise<ApiResult<boolean>> {
            try {
                const res = await fetch(`/api/classrooms/${classroom_id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                const json = await res.json();

                if (!res.ok) return handleReturnError(json.error || "Failed to delete classroom");

                return { success: true, data: json.data };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async updateClassroomName(classroom_id: Classroom['id'], name: Classroom['name']): Promise<ApiResult<ClassroomWithStudentCount>> {
            try {
                const res = await fetch(`/api/classrooms/${classroom_id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                    }),
                });

                const json = await res.json();

                if (!res.ok) return handleReturnError(json.error || "Failed to update classroom");

                return { success: true, data: json.data as ClassroomWithStudentCount };
            } catch (error) {
                return handleReturnError(error);
            }
        }
    }
}