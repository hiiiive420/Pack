import mongoose from "mongoose";

const ledgerSheetSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },

    voucherNo: {
      type: String,
      trim: true,
      required: true
    },

    // 🔗 Project reference
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    projectCode: { type: String, required: true },
    projectName: { type: String, required: true },

    subCodeOfExpenditure: { type: String, trim: true },
    typeOfExpenditure: { type: String, trim: true },

    // 🔗 Payee reference
    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payee",
      required: true
    },

    payeeName: { type: String, required: true },

    description: { type: String, trim: true },

    budgetedAmount: { type: Number, default: 0 },
    expenditureAmount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },

    sign: {
      type: String,
      enum: ["SC", "SAB"]
    },

    remarks: { type: String, trim: true },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("LedgerSheet", ledgerSheetSchema);
