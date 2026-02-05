import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createAdvanceSettlement,
  getAdvanceSettlements,
  updateAdvanceSettlement,
  deleteAdvanceSettlement
} from "../controllers/advanceSettlement.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getAdvanceSettlements);
router.post("/", createAdvanceSettlement);
router.put("/:id", updateAdvanceSettlement);
router.delete("/:id", deleteAdvanceSettlement);

export default router;
