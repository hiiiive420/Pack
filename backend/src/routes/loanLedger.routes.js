import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createLoanLedger,
  getLoanLedgers,
  updateLoanLedger,
  deleteLoanLedger
} from "../controllers/loanLedger.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getLoanLedgers);
router.post("/", createLoanLedger);
router.put("/:id", updateLoanLedger);
router.delete("/:id", deleteLoanLedger);

export default router;
