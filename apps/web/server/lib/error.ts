export class AppError extends Error {
  statusCode: number; // HTTP status code to return
  isOperational: boolean; // Indicates if this is a known, expected error (vs. unexpected crash)

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name; // Set error name to class name
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace for better debugging (optional, but good practice)
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.", statusCode = 404) {
    super(message, statusCode);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(
    message = "Conflict: A resource with this name already exists.",
    statusCode = 409,
  ) {
    super(message, statusCode);
    this.name = "ConflictError";
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = "Forbidden: Insufficient permissions.",
    statusCode = 403,
  ) {
    super(message, statusCode);
    this.name = "ForbiddenError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request: Invalid input.", statusCode = 400) {
    super(message, statusCode);
    this.name = "BadRequestError";
  }
}
