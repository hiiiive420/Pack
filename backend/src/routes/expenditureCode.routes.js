import express from "express";
import {
  createExpenditureCode,
  getExpenditureCodes,
  updateExpenditureCode,
  disableExpenditureCode
} from "../controllers/expenditureCode.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createExpenditureCode);
router.get("/", protect, getExpenditureCodes);
router.put("/:id", protect, updateExpenditureCode);
router.delete("/:id", protect, disableExpenditureCode);

export default router;
