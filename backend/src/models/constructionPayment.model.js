import mongoose from "mongoose";

const constructionPaymentSchema = new mongoose.Schema(
  {
    // ===== CONTRACT HEADER =====
    contractCode: { type: String, required: true, trim: true },
    contractName: { type: String, trim: true },

    contractorName: { type: String, required: true, trim: true },

    // ✅ FIX 1: ADD THESE
    contractorAddress: { type: String, trim: true },
    contractorContactNo: { type: String, trim: true },

    contractSum: { type: Number },
    retention: { type: String },
    contractPeriod: { type: String },
    vatNo: { type: String },
    mobilizationAdvance: { type: String },
    performanceBond: { type: String },

    // ===== PAYMENT ROW =====
    date: { type: Date, required: true },

    description: { type: String, trim: true },

    amountExcludingVAT: { type: Number },
    retentionAmount: { type: Number },
    vatAmount: { type: Number },

    voucherAmountIncludingVAT: { type: Number },
    cumulativeAmount: { type: Number },

    ma: { type: String },

    // ✅ FIX 2: PAYMENT METHOD
    paymentType: {
      type: String,
      enum: ["B", "DB", "SAB", "AB"],
      required: true
    },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model(
  "ConstructionPayment",
  constructionPaymentSchema
);
