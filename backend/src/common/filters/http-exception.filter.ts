import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      message = exceptionResponse.message || exception.message;
      code = exceptionResponse.error || 'HTTP_EXCEPTION';

      // If validation pipe returns array of messages, put them in details
      if (Array.isArray(exceptionResponse.message)) {
        message = 'Validation failed';
        details = exceptionResponse.message;
        code = 'VALIDATION_ERROR';
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma specific errors
      status = HttpStatus.BAD_REQUEST;
      code = `PRISMA_ERROR_${exception.code}`;

      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Unique constraint failed. Record already exists.';
          details = exception.meta;
          code = 'DUPLICATE_RECORD';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found.';
          details = exception.meta;
          code = 'RECORD_NOT_FOUND';
          break;
        default:
          message = 'Database request error';
          details = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
