import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createVisitingPayment,
  getVisitingPayments,
  updateVisitingPayment,
  deleteVisitingPayment
} from "../controllers/visitingPayment.controller.js";

const router = express.Router();
router.use(protect);

router.get("/", getVisitingPayments);
router.post("/", createVisitingPayment);
router.put("/:id", updateVisitingPayment);
router.delete("/:id", deleteVisitingPayment);

export default router;
