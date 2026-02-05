import mongoose from "mongoose";

const researchConferenceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },

    conferenceCode: {
      type: String,
      required: true,
      trim: true
    },

    conferenceName: {
      type: String,
      required: true,
      trim: true
    },

    expenditureCode: {
      type: String,
      required: true,
      trim: true
    },

    typeOfExpenditure: {
      type: String,
      required: true,
      trim: true
    },

    approvedAmount: {
      type: String,
      required: true
    },

    supplierName: {
      type: String,
      required: true,
      trim: true
    },

    actualAmount: {
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
  "ResearchConference",
  researchConferenceSchema
);
