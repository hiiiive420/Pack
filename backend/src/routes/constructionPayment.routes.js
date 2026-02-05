import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createConstructionPayment,
  getConstructionPayments,
  updateConstructionPayment,
  deleteConstructionPayment
} from "../controllers/constructionPayment.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getConstructionPayments);
router.post("/", createConstructionPayment);
router.put("/:id", updateConstructionPayment);
router.delete("/:id", deleteConstructionPayment);

export default router;
