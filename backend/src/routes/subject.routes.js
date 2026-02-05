import express from "express";
import {
  createSubject,
  getSubjects,
  updateSubject,
  disableSubject
} from "../controllers/subject.controller.js";
import { protect } from "../middleware/auth.js";
import { allowPermission } from "../middleware/permission.js";

const router = express.Router();

router.use(protect);
router.use(allowPermission("MAINTENANCE_MANAGEMENT"));

router.post("/", createSubject);
router.get("/", getSubjects);
router.put("/:id", updateSubject);
router.delete("/:id", disableSubject);

export default router;
