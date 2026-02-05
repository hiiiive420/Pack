import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createAgraharaInsurance,
  getAgraharaInsurances,
  updateAgraharaInsurance,
  deleteAgraharaInsurance
} from "../controllers/agraharaInsurance.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getAgraharaInsurances);
router.post("/", createAgraharaInsurance);
router.put("/:id", updateAgraharaInsurance);
router.delete("/:id", deleteAgraharaInsurance);

export default router;
