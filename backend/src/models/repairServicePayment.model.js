import mongoose from "mongoose";

const repairServicePaymentSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },

    natureOfItems: {
      type: String,
      required: true,
      trim: true
    },

    itemTag: {
      type: String,
      trim: true
    },

    serialNo: {
      type: String,
      trim: true
    },

    supplierName: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    amount: {
      type: String,
      required: true
    },

    cumulative: {
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

export default mongoose.model(
  "RepairServicePayment",
  repairServicePaymentSchema
);
