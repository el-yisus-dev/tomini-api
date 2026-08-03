import { type Response, type Request, type NextFunction } from 'express'
import { getErrorMessages, getErrorType } from "../utils/mongoose.js"

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const parseError = error as Error;
  const statusCode = res.locals?.statusCode ?? 400;

  res.status(statusCode).json({
    message: getErrorType(parseError),
    errors: getErrorMessages(parseError),
  });
};
