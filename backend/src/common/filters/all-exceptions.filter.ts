import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('UnhandledException');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Si ya es una HttpException, dejar que el HttpExceptionFilter lo maneje
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (request.path.startsWith('/mta')) {
        if (typeof exceptionResponse === 'object') {
          return response.status(status).json(exceptionResponse);
        }
        return response.status(status).json({ error: exceptionResponse });
      }

      const message =
        typeof exceptionResponse === 'object' && 'message' in (exceptionResponse as object)
          ? (exceptionResponse as any).message
          : exceptionResponse;

      const error =
        typeof exceptionResponse === 'object' && 'error' in (exceptionResponse as object)
          ? (exceptionResponse as any).error
          : HttpStatus[status];

      this.logger.error(`[HTTP ${status}] ${request.method} ${request.url} — ${message}`);
      return response.status(status).json({
        success: false,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
        error,
      });
    }

    // Error inesperado (DB, null pointer, etc.) — log completo con stack
    const err = exception as any;
    const message = err?.message || 'Internal server error';
    const stack = err?.stack || '';

    this.logger.error(
      `[UNHANDLED 500] ${request.method} ${request.url}\nMessage: ${message}\nStack: ${stack}`,
    );

    // Si la respuesta ya fue enviada (ej: tras un res.redirect()), no hacer nada
    if (response.headersSent) return;

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
      error: 'Internal Server Error',
    });
  }
}
