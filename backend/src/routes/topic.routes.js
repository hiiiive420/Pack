import express from "express";
import {
  createTopic,
  getTopics,
  updateTopic,
  disableTopic
} from "../controllers/topic.controller.js";
import { protect } from "../middleware/auth.js";
import { allowPermission } from "../middleware/permission.js";

const router = express.Router();

router.use(protect);
router.use(allowPermission("MAINTENANCE_MANAGEMENT"));

router.post("/", createTopic);
router.get("/", getTopics);
router.put("/:id", updateTopic);
router.delete("/:id", disableTopic);

export default router;
