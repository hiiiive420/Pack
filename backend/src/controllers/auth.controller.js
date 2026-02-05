import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logAction } from "../utils/auditLogger.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      permissions: user.permissions,
      email: user.email              // ✅ IMPORTANT
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // ✅ MANUALLY INJECT USER FOR AUDIT LOG
  await logAction({
    req: {
      ...req,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    },
    action: "LOGIN",
    module: "AUTH",
    recordId: user.email,
    description: "User logged in"
  });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      permissions: user.permissions
    }
  });
};
