import mongoose from "mongoose";

const miscellaneousSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },

    expenditureCode: {
      type: String,
      required: true,
      trim: true
    },

    expenditureType: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    amount: {
      type: Number,
      required: true
    },

    remarks: {
      type: String,
      trim: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Miscellaneous", miscellaneousSchema);
