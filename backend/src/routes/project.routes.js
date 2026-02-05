import express from "express";
import {
  createProject,
  getProjects,
  updateProject,
  disableProject
} from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, disableProject);

export default router;
