import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (request.path.startsWith('/mta')) {
      if (typeof exceptionResponse === 'object') {
        return response.status(status).json(exceptionResponse);
      }
      return response.status(status).json({ error: exceptionResponse });
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        typeof exceptionResponse === 'object' && 'message' in (exceptionResponse as object)
          ? (exceptionResponse as any).message
          : exceptionResponse,
      error:
        typeof exceptionResponse === 'object' && 'error' in (exceptionResponse as object)
          ? (exceptionResponse as any).error
          : HttpStatus[status],
    };

    this.logger.error(`${request.method} ${request.url} - ${status}`);
    response.status(status).json(errorResponse);
  }
}
