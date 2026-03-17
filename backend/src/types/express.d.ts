import "express";

declare module "express" {
  interface Request {
    user?: {
      sub: number;
      role: string;
    };
  }
}
