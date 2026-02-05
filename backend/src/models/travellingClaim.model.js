import mongoose from "mongoose";

const travellingClaimSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payee",
      required: true
    },

    // 🔐 SNAPSHOT FIELDS
    empNo: {
      type: String,
      required: true
    },

    employeeName: {
      type: String,
      required: true
    },

    dateOfTravelling: {
      type: String,
      required: true
    },

    appliedDateForTravellingClaim: {
      type: String,
      required: true
    },

    transportAllowance: {
      type: String,
      trim: true
    },

    combinedAllowance: {
      type: String,
      trim: true
    },

    additionalAllowance: {
      type: String,
      trim: true
    },

    lateFines: {
      type: String,
      trim: true
    },

    total: {
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

export default mongoose.model("TravellingClaim", travellingClaimSchema);
