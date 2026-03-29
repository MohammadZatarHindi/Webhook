import { Response } from 'express';
import { ACTION_MESSAGES, Action } from './actionMessages';

interface SendResponseOptions {
  res: Response;
  entity?: string;
  action?: Action;
  data?: any;
  statusCode?: number;
  meta?: Record<string, any>;
  error?: string;
}

// Type guard
const isNotFoundAction = (a: Action | undefined): a is 'notFound' =>
  a === 'notFound';

export const sendResponse = ({
  res,
  entity,
  action,
  data,
  statusCode,
  meta,
  error,
}: SendResponseOptions) => {
  const isNotFound = isNotFoundAction(action);
  const isError = !!error;

  /* --------------------------
     MESSAGE
  -------------------------- */
  let message = error
    ? error
    : entity && action
    ? `${entity} ${ACTION_MESSAGES[action]}`
    : 'Success';

  /* --------------------------
     EMPTY ARRAY OVERRIDE
  -------------------------- */
  if (
    action === 'retrieved' &&
    Array.isArray(data) &&
    data.length === 0
  ) {
    message = `No ${entity?.toLowerCase() || 'data'} found`;
  }

  /* --------------------------
     STATUS CODE
  -------------------------- */
  const code =
    statusCode ??
    (isError ? 400 : isNotFound ? 404 : 200);

  /* --------------------------
     RESPONSE
  -------------------------- */
  return res.status(code).json({
    success: !isError && !isNotFound,
    message,
    data: isError ? null : data,
    ...(meta && { meta }), // still useful for pagination later
  });
};