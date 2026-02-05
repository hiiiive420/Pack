import mongoose from "mongoose";

const utilityExpenseSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },

    utilityCode: { type: String, trim: true },
    utilityName: { type: String, trim: true },

    accountNumber: { type: String, trim: true },
    period: { type: String, trim: true },

    meterReading: { type: String, trim: true },
    usedUnits: { type: String, trim: true },

    amount: { type: Number },
    total: { type: Number },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("UtilityExpense", utilityExpenseSchema);
