import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { theaterSchema } from "../validators/theater.schema";
import * as theaterController from "../controllers/theater.controller";

const router = Router();

router.get("/", authenticate, theaterController.getAll);
router.get("/:id", authenticate, theaterController.getById);
router.post("/", authenticate, requireRole("admin"), validate(theaterSchema), theaterController.create);
router.put("/:id", authenticate, requireRole("admin"), validate(theaterSchema), theaterController.update);
router.delete("/:id", authenticate, requireRole("admin"), theaterController.remove);

export default router;
