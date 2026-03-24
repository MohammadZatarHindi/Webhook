// Custom error class to standardize application errors
export class AppError extends Error {
  // HTTP status code associated with the error (default is 500)
  statusCode: number;

  // Constructor accepts an error message and optional status code
  constructor(message: string, statusCode = 500) {
    // Call the parent Error constructor with the message
    super(message);

    // Assign the provided status code to the instance
    this.statusCode = statusCode;

    // Capture the stack trace for this error, excluding the constructor call
    // This helps with debugging by showing where the error originated
    Error.captureStackTrace(this, this.constructor);
  }
}