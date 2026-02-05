import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createExamSchedule,
  getExamSchedules,
  updateExamSchedule,
  deleteExamSchedule
} from "../controllers/examSchedule.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getExamSchedules);
router.post("/", createExamSchedule);
router.put("/:id", updateExamSchedule);
router.delete("/:id", deleteExamSchedule);

export default router;
