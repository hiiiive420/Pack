import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createForeignStudentPayment,
  getForeignStudentPayments,
  updateForeignStudentPayment,
  deleteForeignStudentPayment
} from "../controllers/foreignStudentPayment.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getForeignStudentPayments);
router.post("/", createForeignStudentPayment);
router.put("/:id", updateForeignStudentPayment);
router.delete("/:id", deleteForeignStudentPayment);

export default router;
