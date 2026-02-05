import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createPettyCash,
  getPettyCash,
  updatePettyCash,
  deletePettyCash
} from "../controllers/pettyCash.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getPettyCash);
router.post("/", createPettyCash);
router.put("/:id", updatePettyCash);
router.delete("/:id", deletePettyCash);

export default router;
