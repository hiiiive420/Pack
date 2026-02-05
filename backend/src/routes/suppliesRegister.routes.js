import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createSupply,
  getSupplies,
  updateSupply,
  deleteSupply
} from "../controllers/suppliesRegister.controller.js";

const router = express.Router();

router.use(protect);

router.post("/", createSupply);
router.get("/", getSupplies);
router.put("/:id", updateSupply);
router.delete("/:id", deleteSupply);

export default router;
