import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { eventSchema } from "../validators/event.schema";
import { eventQuerySchema } from "../validators/query.schema";
import * as eventController from "../controllers/event.controller";

const router = Router();

router.get("/", authenticate, validate(eventQuerySchema, "query"), eventController.getAll);
router.get("/:id", authenticate, eventController.getById);
router.post("/", authenticate, requireRole("admin"), validate(eventSchema), eventController.create);
router.put("/:id", authenticate, requireRole("admin"), validate(eventSchema), eventController.update);
router.delete("/:id", authenticate, requireRole("admin"), eventController.remove);

export default router;
