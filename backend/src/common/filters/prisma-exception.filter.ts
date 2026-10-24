import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

const STATUS_BY_CODE: Record<string, { status: HttpStatus; message: string }> =
  {
    P2002: { status: HttpStatus.CONFLICT, message: 'Resource already exists' },
    P2003: {
      status: HttpStatus.CONFLICT,
      message: 'Resource is referenced by another record',
    },
    P2025: { status: HttpStatus.NOT_FOUND, message: 'Resource not found' },
  };

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const mapped = STATUS_BY_CODE[exception.code] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error',
    };

    response.status(mapped.status).json({
      statusCode: mapped.status,
      message: mapped.message,
      error: HttpStatus[mapped.status],
    });
  }
}
