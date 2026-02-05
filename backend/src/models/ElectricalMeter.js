import mongoose from "mongoose";

const electricalMeterSchema = new mongoose.Schema(
  {
    meterNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    projectCode: {
      type: String,
      required: true,
      index: true
    },

    departmentCode: {
      type: String,
      required: true
    },

    building: {
      type: String,
      required: true,
      trim: true
    },

    ownership: {
      type: String,
      required: true,
      trim: true
    },

    vote: {
      type: String,
      required: true,
      trim: true
    },

    sourceOfFund: {
      type: String,
      trim: true,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("ElectricalMeter", electricalMeterSchema);
