import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // AppError (our custom errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid input data", details },
    });
    return;
  }

  // Prisma known errors
  if (err && typeof err === "object" && "code" in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } };
    if (prismaErr.code === "P2002") {
      res.status(409).json({
        error: { code: "CONFLICT", message: "Resource already exists" },
      });
      return;
    }
    if (prismaErr.code === "P2025") {
      res.status(404).json({
        error: { code: "NOT_FOUND", message: "Resource not found" },
      });
      return;
    }
  }

  // Unknown errors
  logger.error(err, "Unhandled error");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message:
        env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : err.message,
    },
  });
}
