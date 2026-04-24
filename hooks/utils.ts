/**
 * Result wrapper for API responses
 */
export type ApiResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

/**
 * Error response from Supabase
 */
export interface ApiError {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
}

/**
 * Handle Supabase errors and return formatted error
 */
export function handleError(error: unknown): ApiError {
    if (error && typeof error === 'object' && 'message' in error) {
        return {
            message: (error as any).message || 'An error occurred',
            code: (error as any).code,
            details: (error as any).details,
            hint: (error as any).hint,
        };
    }
    return {
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}

export function handleReturnError(error: unknown): { success: false; error: string } {
    const apiError = handleError(error);
    return { success: false, error: apiError.message };
}

/**
 * Wrap async operations with error handling
 */
export async function withErrorHandling<T>(
    operation: () => Promise<T>
): Promise<ApiResult<T>> {
    try {
        const data = await operation();
        return { success: true, data };
    } catch (error) {
        const apiError = handleError(error);
        return { success: false, error: apiError.message };
    }
}