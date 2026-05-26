import { handleReturnError, type ApiResult } from "./utils";
import type { EducatorRow } from "@/types";
import { createClient } from "@/lib/supabase-client";

export function createEducatorsAPI() {
    return {
        async fetchAllEducators(): Promise<ApiResult<EducatorRow[]>> {
            try {
                const res = await fetch("/api/educators", {
                    method: "GET",
                });

                const json = await res.json();

                if (!res.ok) return handleReturnError(json.error || "Failed to fetch educators");

                return { success: true, data: json.data };
            } catch (error) {
                return handleReturnError(error)
            }
        },
        // TODO: To be implemented properly later, same structure as on createClassroom
        async createEducator(data: Partial<EducatorRow> & { id: string }): Promise<ApiResult<boolean>> {
            try {
                const res = await fetch(`/api/educators/${data.id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                const json = await res.json();

                if (!res.ok) return handleReturnError(json.error || "Failed to create educator");

                return { success: true, data: true };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async fetchEducatorById(id: string): Promise<ApiResult<EducatorRow | null>> {
            try {
                const res = await fetch(`/api/educators/${id}`, {
                    method: "GET",
                });

                const json = await res.json();

                if (!res.ok) return handleReturnError(json.error || "Failed to fetch educator");

                return { success: true, data: json.data };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async deleteEducator(educatorId: string): Promise<ApiResult<any>> {
            try {
                const response = await fetch(`/api/users/${educatorId}`, {
                    method: "DELETE",
                });
                const result = await response.json();
                if (!response.ok) {
                    return handleReturnError(result.error || "Failed to delete educator");
                }
                return { success: true, data: null };
            } catch (err: any) {
                return handleReturnError(err.message || "An unexpected error occurred");
            }
        },
        async updateEducatorProfile(educatorId: string, updates: any): Promise<ApiResult<any>> {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("educator")
                    .update({
                        license_id: updates.license_id,
                        workplace_name: updates.workplace_name,
                        workplace_address: updates.workplace_address,
                        undergrad: updates.undergrad,
                        masters: updates.masters,
                        doctorate: updates.doctorate
                    })
                    .eq("id", educatorId)
                    .select()
                    .single();

                if (error) {
                    return handleReturnError(error.message);
                }
                return { success: true, data };
            } catch (err: any) {
                return handleReturnError(err.message || "An unexpected error occurred");
            }
        },
        async updateEducator(data: Partial<EducatorRow> & { id: string }): Promise<ApiResult<boolean>> {
            try {
                const res = await fetch(`/api/educators/${data.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                const json = await res.json();

                if (!res.ok) return handleReturnError(json.error || "Failed to update educator");

                return { success: true, data: true };
            } catch (error) {
                return handleReturnError(error);
            }
        }
    }
}