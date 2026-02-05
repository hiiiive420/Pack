import express from "express";
import {
  createMeter,
  getMeters,
  updateMeter,
  disableMeter
} from "../controllers/electricalMeter.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createMeter);
router.get("/", getMeters);
router.put("/:id", updateMeter);
router.delete("/:id", disableMeter);

export default router;
