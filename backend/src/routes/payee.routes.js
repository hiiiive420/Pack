import express from "express";
import {
  createPayee,
  getPayees,
  getPayeeAllocations,
  disablePayee,
  updatePayee
} from "../controllers/payee.controller.js";
import { protect } from "../middleware/auth.js";
import { allowPermission } from "../middleware/permission.js";

const router = express.Router();

router.use(protect);
router.use(allowPermission("MAINTENANCE_MANAGEMENT"));

router.post("/", createPayee);
router.get("/", getPayees);
router.get("/:payeeId/allocations", getPayeeAllocations);
router.delete("/:id", disablePayee);
router.put("/:id", updatePayee);



export default router;
