import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createOvertimeLedger,
  getOvertimeLedgers,
  updateOvertimeLedger,
  deleteOvertimeLedger
} from "../controllers/overtimeLedger.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getOvertimeLedgers);
router.post("/", createOvertimeLedger);
router.put("/:id", updateOvertimeLedger);
router.delete("/:id", deleteOvertimeLedger);

export default router;
