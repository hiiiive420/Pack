import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createResearchGrant,
  getResearchGrants,
  updateResearchGrant,
  deleteResearchGrant
} from "../controllers/researchGrant.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getResearchGrants);
router.post("/", createResearchGrant);
router.put("/:id", updateResearchGrant);
router.delete("/:id", deleteResearchGrant);

export default router;
