import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createUDF,
  getUDFs,
  updateUDF,
  deleteUDF
} from "../controllers/universityDevelopmentFund.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getUDFs);
router.post("/", createUDF);
router.put("/:id", updateUDF);
router.delete("/:id", deleteUDF);

export default router;
