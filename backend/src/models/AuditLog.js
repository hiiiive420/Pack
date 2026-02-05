// models/AuditLog.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    userEmail: {
      type: String,
      default: "SYSTEM"
    },

    userRole: {
      type: String,
      default: "GUEST"
    },

    action: {
      type: String,
      required: true
    },

    module: {
      type: String,
      required: true
    },

    recordId: {
      type: String,
      default: null
    },

    description: String,

    oldData: mongoose.Schema.Types.Mixed,
    newData: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
