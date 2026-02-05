import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createLedgerSheet,
  getLedgerSheets,
  updateLedgerSheet,
  deleteLedgerSheet
} from "../controllers/ledgerSheet.controller.js";

const router = express.Router();
router.use(protect);

router.get("/", getLedgerSheets);
router.post("/", createLedgerSheet);
router.put("/:id", updateLedgerSheet);
router.delete("/:id", deleteLedgerSheet);

export default router;
