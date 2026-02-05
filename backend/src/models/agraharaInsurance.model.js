import mongoose from "mongoose";

const agraharaInsuranceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },

    description: {
      type: String,
      trim: true,
      required: true
    },

    noOfContribute: {
      type: String,
      trim: true,
      required: true
    },

    universityContribution: {
      type: String,
      trim: true,
      required: true
    },

    staffContribution: {
      type: String,
      trim: true,
      required: true
    },

    totalAmount: {
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
  "AgraharaInsurance",
  agraharaInsuranceSchema
);
