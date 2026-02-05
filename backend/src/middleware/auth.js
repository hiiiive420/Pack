import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = {
      userId: user._id,
      role: user.role,
      permissions: user.permissions,
      email: decoded.email
    };

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
