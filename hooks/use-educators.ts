import { SupabaseClient } from "@supabase/supabase-js";
import { handleReturnError, type ApiResult } from "./utils";

type EducatorRow = {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string | null;
    nickname?: string | null;
    classroom_count: number;
};

export default function createEducatorsAPI(supabase: SupabaseClient) {
    return {
        async fetchAllEducators(): Promise<ApiResult<EducatorRow[]>> {
            try {
                const { data, error } = await supabase.functions.invoke("educators-list");

                if (error) return handleReturnError(error);

                let educators: EducatorRow[] = [];

                if (Array.isArray(data)) {
                    educators = data;
                } else if (Array.isArray((data as any)?.educators)) {
                    educators = (data as any).educators;
                } else if (Array.isArray((data as any)?.data)) {
                    educators = (data as any).data;
                } else {
                    console.error("Unexpected educators response shape:", data);
                }

                return { success: true, data: educators };
            } catch (error) {
                return handleReturnError(error);
            }
        },

        async deleteEducator(id: string): Promise<ApiResult<boolean>> {
            try {
                const { error } = await supabase.from("educators").delete().eq("id", id);
                if (error) return handleReturnError(error);
                return { success: true, data: true };
            } catch (error) {
                return handleReturnError(error);
            }
        }
    }
}