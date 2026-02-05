import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createUtilityExpense,
  getUtilityExpenses,
  updateUtilityExpense,
  deleteUtilityExpense
} from "../controllers/utilityExpense.controller.js";

const router = express.Router();
router.use(protect);

router.get("/", getUtilityExpenses);
router.post("/", createUtilityExpense);
router.put("/:id", updateUtilityExpense);
router.delete("/:id", deleteUtilityExpense);

export default router;
