import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { createReservationSchema } from "../validators/reservation.schema";
import * as reservationController from "../controllers/reservation.controller";

const router = Router();

// User routes
router.get("/", authenticate, reservationController.getByUser);
router.post("/", authenticate, validate(createReservationSchema), reservationController.create);
router.patch("/:id/cancel", authenticate, reservationController.cancel);

// Admin routes
router.get("/admin", authenticate, requireRole("admin"), reservationController.getAllAdmin);
router.patch("/admin/:id/cancel", authenticate, requireRole("admin"), reservationController.cancelAdmin);

export default router;
