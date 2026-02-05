import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createFuelAllowance,
  getFuelAllowances,
  updateFuelAllowance,
  deleteFuelAllowance
} from "../controllers/fuelAllowance.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getFuelAllowances);
router.post("/", createFuelAllowance);
router.put("/:id", updateFuelAllowance);
router.delete("/:id", deleteFuelAllowance);

export default router;
