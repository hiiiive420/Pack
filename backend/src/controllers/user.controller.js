import bcrypt from "bcrypt";
import User from "../models/User.js";
import { ALL_MODULES } from "../constants/managementModules.js";
import { logAction } from "../utils/auditLogger.js";

export const createUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    let { name, email, password, permissions } = req.body;
    email = email.toLowerCase().trim();

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        message: "At least one management module must be selected"
      });
    }

    for (const perm of permissions) {
      if (!ALL_MODULES.includes(perm)) {
        return res.status(400).json({
          message: `Invalid management module: ${perm}`
        });
      }
    }

    for (const perm of permissions) {
      const exists = await User.findOne({
        role: "CLERK",
        permissions: perm
      });

      if (exists) {
        return res.status(400).json({
          message: `${perm} is already assigned to ${exists.email}`
        });
      }
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "CLERK",
      permissions
    });

    const userForLog = user.toObject();
    delete userForLog.password;

    await logAction({
      req,
      action: "CREATE",
      module: "USER",
      recordId: user.email,
      newData: userForLog,
      description: "Admin created user"
    });

    return res.status(201).json({
      message: "User created successfully",
      user
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
