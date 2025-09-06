import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  log(message: string) {
    super.log(message);
  }

  error(message: string, trace?: string) {
    super.error(message, trace);
  }

  warn(message: string) {
    super.warn(message);
  }
}
