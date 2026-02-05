import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createMiscellaneous,
  getMiscellaneous,
  updateMiscellaneous,
  deleteMiscellaneous
} from "../controllers/miscellaneous.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getMiscellaneous);
router.post("/", createMiscellaneous);
router.put("/:id", updateMiscellaneous);
router.delete("/:id", deleteMiscellaneous);

export default router;
