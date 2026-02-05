import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createHolidayPayment,
  getHolidayPayments,
  updateHolidayPayment,
  deleteHolidayPayment
} from "../controllers/holidayPayment.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getHolidayPayments);
router.post("/", createHolidayPayment);
router.put("/:id", updateHolidayPayment);
router.delete("/:id", deleteHolidayPayment);

export default router;
