import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createHonorarium,
  getHonorariums,
  updateHonorarium,
  deleteHonorarium
} from "../controllers/honorarium.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getHonorariums);
router.post("/", createHonorarium);
router.put("/:id", updateHonorarium);
router.delete("/:id", deleteHonorarium);

export default router;
