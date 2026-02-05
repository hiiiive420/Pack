import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js"; // 👈 THIS WAS MISSING
import { createUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/create", protect, createUser);
router.get("/assigned-modules", protect, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const users = await User.find(
      { role: "CLERK" },
      { permissions: 1, email: 1 }
    );

    const assigned = {};

    users.forEach((u) => {
      u.permissions.forEach((p) => {
        assigned[p] = u.email;
      });
    });

    res.json(assigned);
  } catch (err) {
    console.error("ASSIGNED MODULES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/disable/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({ message: "Cannot disable admin" });
    }

    user.isActive = false;
    user.permissions = []; // 🔓 release modules
    await user.save();

    res.json({ message: "User disabled successfully" });
  } catch (err) {
    console.error("DISABLE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/", protect, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }

  const users = await User.find(
    { role: "CLERK" },
    { password: 0 }
  );

  res.json(users);
});

router.put("/reassign/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { permissions } = req.body;
    const userId = req.params.id;

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        message: "At least one module must be selected"
      });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "CLERK") {
      return res.status(404).json({ message: "Clerk not found" });
    }

    // 🔒 Exclusive ownership check (exclude this user)
    for (const perm of permissions) {
      const exists = await User.findOne({
        _id: { $ne: userId },
        role: "CLERK",
        permissions: perm
      });

      if (exists) {
        return res.status(400).json({
          message: `${perm} is already assigned to ${exists.email}`
        });
      }
    }

    // ♻️ Reassign
    user.permissions = permissions;
    await user.save();

    res.json({
      message: "User reassigned successfully",
      user
    });
  } catch (err) {
    console.error("REASSIGN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
