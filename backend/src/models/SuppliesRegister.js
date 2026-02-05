import mongoose from "mongoose";

const suppliesRegisterSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },

    itemType: {
      type: String,
      enum: ["CAPITAL", "RECURRENT"],
      required: true
    },

    natureCode: {
      type: String,
      required: true
    },

    natureDescription: {
      type: String,
      required: true
    },

    supplierName: {
      type: String,
      required: true
    },

    items: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "SuppliesRegister",
  suppliesRegisterSchema
);
