import express from "express";
import {
  createProgramme,
  getProgrammes,
  updateProgramme,
  disableProgramme
} from "../controllers/programme.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createProgramme);
router.get("/", protect, getProgrammes);
router.put("/:id", protect, updateProgramme);
router.delete("/:id", protect, disableProgramme);

export default router;
