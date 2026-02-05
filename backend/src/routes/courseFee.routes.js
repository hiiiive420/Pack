import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createCourseFee,
  getCourseFees,
  updateCourseFee,
  deleteCourseFee
} from "../controllers/courseFee.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getCourseFees);
router.post("/", createCourseFee);
router.put("/:id", updateCourseFee);
router.delete("/:id", deleteCourseFee);

export default router;
