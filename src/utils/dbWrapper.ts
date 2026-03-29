export const withDbErrorHandling = async <T>(
  fn: () => Promise<T>
): Promise<T> => {
  try {
    return await fn();
  } catch (err: any) {
    console.error(err);

    let message = 'Database error';

    if (err.code) {
      switch (err.code) {
        case '23505':
          message = 'Duplicate value violates a unique constraint';
          break;
        case '23503':
          message = 'Invalid reference: foreign key constraint failed';
          break;
        case '23502':
          message = 'Missing required field';
          break;
        case '42P01':
          message = 'Table does not exist';
          break;
        case '42703':
          message = 'Column does not exist';
          break;
        default:
          message = err.message || 'Database error';
      }
    } else if (err.message) {
      message = err.message;
    }

    const error = new Error(message);
    (error as any).statusCode = 400;

    throw error;
  }
};