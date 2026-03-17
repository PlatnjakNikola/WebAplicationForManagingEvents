import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface JwtPayload {
  sub: number;
  role: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Missing or invalid token" },
    });
    return;
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const payload = decoded as unknown as JwtPayload;
    req.user = { sub: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
  }
}
