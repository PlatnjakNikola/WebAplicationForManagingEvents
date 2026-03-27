import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorMiddleware } from "./middleware/error.middleware";
import { prisma } from "./config/prisma";
import authRoutes from "./routes/auth.routes";
import theaterRoutes from "./routes/theater.routes";
import eventRoutes from "./routes/event.routes";
import reservationRoutes from "./routes/reservation.routes";
import reviewRoutes from "./routes/review.routes";

const app = express();

// Security & parsing
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(globalLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(pinoHttp({ logger }));

// Lightweight ping — keeps backend alive, no DB (for cron job)
app.get("/api/ping", (_req, res) => {
  res.json({ status: "ok" });
});

// Health check — also wakes up DB from cold start (called from login page)
app.get("/api/health", async (_req, res) => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("DB timeout")), 5000)
  );
  await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/theaters", theaterRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/reviews", reviewRoutes);

// Global error handler (MUST be last)
app.use(errorMiddleware);

export default app;
