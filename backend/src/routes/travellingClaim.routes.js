import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createTravellingClaim,
  getTravellingClaims,
  updateTravellingClaim,
  deleteTravellingClaim
} from "../controllers/travellingClaim.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getTravellingClaims);
router.post("/", createTravellingClaim);
router.put("/:id", updateTravellingClaim);
router.delete("/:id", deleteTravellingClaim);

export default router;
