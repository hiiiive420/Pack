import mongoose from "mongoose";

const advanceSettlementSchema = new mongoose.Schema(
  {
    // -------- ADVANCE --------
    date: {
      type: Date,
      required: true
    },

    voucherNo: {
      type: String,
      required: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    purpose: {
      type: String,
      required: true,
      trim: true
    },

    advanceAmount: {
      type: Number,
      required: true
    },

    // -------- SETTLEMENT (LATER) --------
    settlementDate: {
      type: Date
    },

    expenditureAmount: {
      type: Number
    },

    excessOfExpenditure: {
      type: Number
    },

    underOfExpenditure: {
      type: Number
    },

    receiptNo: {
      type: String,
      trim: true
    },

    // -------- SYSTEM --------
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "AdvanceSettlement",
  advanceSettlementSchema
);
