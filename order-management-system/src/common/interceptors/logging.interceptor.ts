import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const now = Date.now();

    this.logger.log(`Incoming request: ${request.method} ${request.url}`);

    return next
      .handle()
      .pipe(
        tap(() => this.logger.log(`Response status: ${response.statusCode} - ${request.method} ${request.url} - ${Date.now() - now}ms`)),
      );
  }
}