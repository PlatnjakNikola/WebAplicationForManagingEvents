import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { createReviewSchema } from "../validators/review.schema";
import * as reviewController from "../controllers/review.controller";

const router = Router();

// User routes
router.get("/", authenticate, reviewController.getByUser);
router.post("/", authenticate, validate(createReviewSchema), reviewController.create);
router.delete("/:id", authenticate, reviewController.remove);

// Admin routes
router.get("/admin", authenticate, requireRole("admin"), reviewController.getAllAdmin);

export default router;
