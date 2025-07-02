export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

// Not Found Error
export class NotFoundError extends AppError {
  constructor(message = "Resources not found") {
    super(message, 404, true);
  }
}

//  Validation Error
export class ValidationError extends AppError {
  constructor(message = "Invalid request data", details?: any) {
    super(message, 400, true, details);
  }
}

// Bad Request Error
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400, true);
  }
}

// DatabaseError Error
export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, true, details);
  }
}

// Authentication Error
export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, true);
  }
}

// Forbidden Error
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, true);
  }
}
