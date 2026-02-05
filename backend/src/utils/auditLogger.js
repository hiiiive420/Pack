// utils/auditLogger.js
import AuditLog from "../models/AuditLog.js";

export const logAction = async ({
  req,
  action,
  module,
  recordId = null,
  oldData = null,
  newData = null,
  description = ""
}) => {
  try {
    await AuditLog.create({
      action,
      module,
      recordId,

      // ✅ CORRECT FIELD NAMES
      userId: req.user?._id || null,
      userEmail: req.user?.email || req.body?.email || "SYSTEM",
      userRole: req.user?.role || "GUEST",

      oldData,
      newData,
      description
    });
  } catch (err) {
    console.error("AUDIT LOG ERROR:", err.message);
  }
};
