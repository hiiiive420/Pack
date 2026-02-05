import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createCGUProgram,
  getCGUPrograms,
  updateCGUProgram,
  deleteCGUProgram
} from "../controllers/cguProgram.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getCGUPrograms);
router.post("/", createCGUProgram);
router.put("/:id", updateCGUProgram);
router.delete("/:id", deleteCGUProgram);

export default router;
