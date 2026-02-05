import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  try {
    // ADMIN only
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(500); // safety limit

    res.json(logs);
  } catch (err) {
    console.error("GET AUDIT LOG ERROR:", err);
    res.status(500).json({ message: "Failed to load audit logs" });
  }
};
