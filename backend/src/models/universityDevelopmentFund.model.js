import mongoose from "mongoose";

const universityDevelopmentFundSchema = new mongoose.Schema(
  {
    /* ===== HEADER (MANUAL) ===== */
    balance: {
      type: String,
      trim: true
    },

    profitShareForYear: {
      type: String,
      trim: true
    },

    total: {
      type: String,
      trim: true
    },

    /* ===== ROW DATA ===== */
    date: {
      type: Date,
      required: true
    },

    description: {
      type: String,
      trim: true,
      required: true
    },

    paymentBeneficiary: {
      type: String,
      trim: true,
      required: true
    },

    amountExpense: {
      type: String,
      trim: true,
      required: true
    },

    currentBalance: {
      type: String,
      trim: true,
      required: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "UniversityDevelopmentFund",
  universityDevelopmentFundSchema
);
