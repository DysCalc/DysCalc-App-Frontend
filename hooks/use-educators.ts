import { handleReturnError, type ApiResult } from "./utils";
import type { EducatorRow } from "@/types";

export function createEducatorsAPI() {
    return {
        async fetchAllEducators(): Promise<ApiResult<EducatorRow[]>> {
            try {
                const res = await fetch("/api/educators", {
                    method: "GET",
                });

                const json = await res.json();

                if (!res.ok) {
                    return { success: false, error: json.error || "Failed to fetch educators" };
                }

                return { success: true, data: json.data };
            } catch (error) {
                return handleReturnError(error)
            }
        },
        async createEducator(data: Partial<EducatorRow> & { id: string }): Promise<ApiResult<boolean>> {
            try {
                const res = await fetch(`/api/educator/${data.id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                const json = await res.json();

                if (!res.ok) {
                    return { success: false, error: json.error || "Failed to create educator" };
                }

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

                if (!res.ok) {
                    return { success: false, error: json.error || "Failed to fetch educator" };
                }

                return { success: true, data: json.data };
            } catch (error) {
                return handleReturnError(error);
            }
        },
        async deleteEducator(id: string): Promise<ApiResult<boolean>> {
            try {
                const res = await fetch(`/api/educators/${id}`, {
                    method: "DELETE",
                });

                const json = await res.json();

                if (!res.ok) {
                    return { success: false, error: json.error || "Failed to delete educator" };
                }

                return { success: true, data: true };
            } catch (error) {
                return handleReturnError(error);
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

                if (!res.ok) {
                    return { success: false, error: json.error || "Failed to update educator" };
                }

                return { success: true, data: true };
            } catch (error) {
                return handleReturnError(error);
            }
        }
    }
}