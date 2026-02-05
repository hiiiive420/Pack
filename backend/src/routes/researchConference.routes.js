import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createResearchConference,
  getResearchConferences,
  updateResearchConference,
  deleteResearchConference
} from "../controllers/researchConference.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getResearchConferences);
router.post("/", createResearchConference);
router.put("/:id", updateResearchConference);
router.delete("/:id", deleteResearchConference);

export default router;
