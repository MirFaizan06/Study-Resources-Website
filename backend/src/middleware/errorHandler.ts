import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ZodError — validation failure
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'root';
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your input.',
      code: 'VALIDATION_ERROR',
      errors: fieldErrors,
    } satisfies ErrorResponse & { errors: Record<string, string[]> });
    return;
  }

  // JWT errors
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Your session has expired. Please log in again.',
      code: 'TOKEN_EXPIRED',
    } satisfies ErrorResponse);
    return;
  }

  if (err instanceof JsonWebTokenError || err instanceof NotBeforeError) {
    res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
      code: 'TOKEN_INVALID',
    } satisfies ErrorResponse);
    return;
  }

  // Operational / known AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    } satisfies ErrorResponse);
    return;
  }

  // Unknown / unexpected error — never expose internals
  if (err instanceof Error) {
    console.error('[Unhandled Error]', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error('[Unknown Error]', err);
  }

  res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred. Please try again later.',
    code: 'INTERNAL_ERROR',
  } satisfies ErrorResponse);
}
