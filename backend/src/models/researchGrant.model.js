import mongoose from "mongoose";

const researchGrantSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },

    researchNumber: {
      type: String,
      required: true,
      trim: true
    },

    researcherName: {
      type: String,
      required: true,
      trim: true
    },

   expenditureType: {
  type: String,
  required: true,
  trim: true
},

approvedAmount: {
  type: Number,
  required: true
},


    description: {
      type: String,
      trim: true
    },

    amount: {
      type: Number,
      required: true
    },

    cummulatedAmount: {
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

export default mongoose.model("ResearchGrant", researchGrantSchema);
