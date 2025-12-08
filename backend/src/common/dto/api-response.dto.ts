export class ApiResponse<T> {
    data: T;
    meta?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
