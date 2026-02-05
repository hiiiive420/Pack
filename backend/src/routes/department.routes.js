import express from "express";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  disableDepartment
} from "../controllers/department.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createDepartment);
router.get("/", protect, getDepartments);
router.put("/:id", protect, updateDepartment);
router.delete("/:id", protect, disableDepartment);

export default router;
