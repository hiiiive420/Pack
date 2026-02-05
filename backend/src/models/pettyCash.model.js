import mongoose from "mongoose";

const pettyCashSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },

    // 🔗 Department reference
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },

    // 🔒 Snapshot fields (audit safe)
    departmentCode: {
      type: String,
      required: true
    },

    departmentName: {
      type: String,
      required: true
    },

    approvedAmount: {
      type: Number,
      required: true
    },

    description: {
      type: String,
      trim: true
    },

    expenseAmount: {
      type: Number,
      required: true
    },

    balanceAmount: {
      type: Number,
      required: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("PettyCash", pettyCashSchema);
