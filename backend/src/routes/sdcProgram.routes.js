import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createSDCProgram,
  getSDCPrograms,
  updateSDCProgram,
  deleteSDCProgram
} from "../controllers/sdcProgram.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getSDCPrograms);
router.post("/", createSDCProgram);
router.put("/:id", updateSDCProgram);
router.delete("/:id", deleteSDCProgram);

export default router;
