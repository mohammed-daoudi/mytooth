import { NextRequest, NextResponse } from 'next/server';

export interface ErrorContext {
  userId?: string;
  userRole?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: string;
  requestId?: string;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  error?: Error;
  context?: ErrorContext;
  metadata?: Record<string, any>;
}

// Error types for better categorization
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 500, true, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(`External service error: ${service}`, 502, true, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

// Centralized logging class
export class Logger {
  private static instance: Logger;
  private requestId: string | null = null;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.context?.timestamp || new Date().toISOString();
    const requestId = entry.context?.requestId || this.requestId || 'unknown';
    const level = entry.level.toUpperCase();

    return `[${timestamp}] [${level}] [${requestId}] ${entry.message}`;
  }

  private shouldLog(level: LogEntry['level']): boolean {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private writeLog(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return;

    const formattedMessage = this.formatMessage(entry);

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      switch (entry.level) {
        case 'error':
          console.error(formattedMessage, entry.error);
          if (entry.context) console.error('Context:', entry.context);
          if (entry.metadata) console.error('Metadata:', entry.metadata);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'debug':
          console.debug(formattedMessage);
          break;
      }
    }

    // In production, you would send logs to external services
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(entry);
    }
  }

  private async sendToExternalLogger(entry: LogEntry) {
    try {
      // Example: Send to external logging service
      // await fetch(process.env.LOG_ENDPOINT!, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...entry,
      //     service: 'mytooth-api',
      //     environment: process.env.NODE_ENV
      //   })
      // });

      // For now, just log to console in production too
      console.log(JSON.stringify({
        ...entry,
        service: 'mytooth-api',
        environment: process.env.NODE_ENV,
        formatted: this.formatMessage(entry)
      }));
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  info(message: string, context?: ErrorContext, metadata?: Record<string, any>) {
    this.writeLog({ level: 'info', message, context, metadata });
  }

  warn(message: string, context?: ErrorContext, metadata?: Record<string, any>) {
    this.writeLog({ level: 'warn', message, context, metadata });
  }

  error(message: string, error?: Error, context?: ErrorContext, metadata?: Record<string, any>) {
    this.writeLog({ level: 'error', message, error, context, metadata });
  }

  debug(message: string, context?: ErrorContext, metadata?: Record<string, any>) {
    this.writeLog({ level: 'debug', message, context, metadata });
  }
}

// Request context helper
export function getRequestContext(request: NextRequest, userId?: string, userRole?: string): ErrorContext {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return {
    userId,
    userRole,
    endpoint: request.nextUrl.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent') || 'unknown',
    ip,
    timestamp: new Date().toISOString(),
    requestId
  };
}

// Global error handler for API routes
export function handleApiError(
  error: unknown,
  context?: ErrorContext
): NextResponse {
  const logger = Logger.getInstance();

  // Set request ID if available
  if (context?.requestId) {
    logger.setRequestId(context.requestId);
  }

  if (error instanceof AppError) {
    logger.error(
      `API Error: ${error.message}`,
      error,
      context,
      { code: error.code, statusCode: error.statusCode }
    );

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: error.statusCode }
    );
  }

  // Handle validation errors from Zod
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    const zodError = error as any;
    logger.warn(
      'Validation error in API request',
      context,
      { errors: zodError.errors }
    );

    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: zodError.errors,
      },
      { status: 400 }
    );
  }

  // Handle MongoDB errors
  if (error && typeof error === 'object' && 'name' in error) {
    const mongoError = error as any;
    if (mongoError.name === 'MongooseError' || mongoError.name === 'MongoError') {
      logger.error(
        `Database error: ${mongoError.message}`,
        mongoError,
        context
      );

      return NextResponse.json(
        {
          error: 'Database operation failed',
          code: 'DATABASE_ERROR',
          ...(process.env.NODE_ENV === 'development' && { details: mongoError.message })
        },
        { status: 500 }
      );
    }
  }

  // Handle unexpected errors
  const unexpectedError = error instanceof Error ? error : new Error(String(error));
  logger.error(
    `Unexpected error: ${unexpectedError.message}`,
    unexpectedError,
    context
  );

  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        details: unexpectedError.message,
        stack: unexpectedError.stack
      })
    },
    { status: 500 }
  );
}

// Higher-order function to wrap API handlers with error handling
export function withErrorHandler<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const context = getRequestContext(request);
    const logger = Logger.getInstance();

    try {
      // Log request start
      logger.info(
        `${request.method} ${request.nextUrl.pathname}`,
        context
      );

      const response = await handler(request, ...args);

      // Log successful response
      logger.info(
        `${request.method} ${request.nextUrl.pathname} - ${response.status}`,
        context
      );

      return response;
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}

// Performance monitoring helper
export function withPerformanceMonitoring<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const context = getRequestContext(request);
    const logger = Logger.getInstance();

    try {
      const response = await handler(request, ...args);

      const duration = Date.now() - startTime;

      // Log performance metrics
      logger.info(
        `Request completed in ${duration}ms`,
        context,
        { duration, status: response.status }
      );

      // Warn about slow requests
      if (duration > 5000) {
        logger.warn(
          `Slow request detected: ${duration}ms`,
          context,
          { duration }
        );
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        `Request failed after ${duration}ms`,
        error instanceof Error ? error : new Error(String(error)),
        context,
        { duration }
      );
      throw error;
    }
  };
}

// Combine error handling and performance monitoring
export function withApiHandlers<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return withErrorHandler(withPerformanceMonitoring(handler));
}

export default Logger.getInstance();
