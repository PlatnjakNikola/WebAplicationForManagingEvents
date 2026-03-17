import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorMiddleware } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";

const app = express();

// Security & parsing
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(globalLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(pinoHttp({ logger }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);

// Global error handler (MUST be last)
app.use(errorMiddleware);

export default app;
