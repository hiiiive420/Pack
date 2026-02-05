import express from "express";
import {
  createBatch,
  getBatches,
  updateBatch,
  disableBatch
} from "../controllers/batch.controller.js";
import { protect } from "../middleware/auth.js";
import { allowPermission } from "../middleware/permission.js";

const router = express.Router();

router.use(protect);
router.use(allowPermission("MAINTENANCE_MANAGEMENT"));

router.post("/", createBatch);
router.get("/", getBatches);
router.put("/:id", updateBatch);
router.delete("/:id", disableBatch);

export default router;
