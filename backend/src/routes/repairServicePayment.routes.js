import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createRepairServicePayment,
  getRepairServicePayments,
  updateRepairServicePayment,
  deleteRepairServicePayment
} from "../controllers/repairServicePayment.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getRepairServicePayments);
router.post("/", createRepairServicePayment);
router.put("/:id", updateRepairServicePayment);
router.delete("/:id", deleteRepairServicePayment);

export default router;
