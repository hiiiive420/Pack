import express from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getAuditLogs);

export default router;
