import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let code = 'INTERNAL_ERROR';
        let message = 'Internal server error';
        let details = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res: any = exception.getResponse();

            if (typeof res === 'object') {
                code = res.error || 'HTTP_ERROR';
                message = res.message || exception.message;
                details = res.message; // often an array of validation errors
            } else {
                message = res;
            }
        } else {
            console.error(exception);
        }

        response.status(status).json({
            data: null,
            meta: {},
            error: {
                code,
                message,
                details,
            },
        });
    }
}
