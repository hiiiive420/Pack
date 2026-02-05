import mongoose from "mongoose";

const overtimeLedgerSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    month: {
      type: String,
      required: true
    },

    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payee",
      required: true
    },

    // 🔐 SNAPSHOT FIELDS
    empNo: {
      type: String,
      required: true
    },

    employeeName: {
      type: String,
      required: true
    },

    approvedHours: {
      type: String,
      required: true
    },

    workedHours: {
      type: String,
      required: true
    },

    paidHours: {
      type: String,
      required: true
    },

    rate: {
      type: String,
      required: true
    },

    amount: {
      type: String,
      required: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("OvertimeLedger", overtimeLedgerSchema);
