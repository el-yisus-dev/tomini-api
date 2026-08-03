import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate =
  (
    schema: ZodType,
    property: "body" | "params" | "query" = "body"
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return res.status(400).json({
        status: "error",
        messages: result.error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req[property] = result.data;

    next();
  };