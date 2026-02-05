import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{5}$/ // exactly 5 digits
    },
    name: {
      type: String,
      required: true
    },
    projectCode: {
      type: String,
      required: true,
      match: /^\d{3}$/
    },
    programmeCode: {
      type: String,
      required: true,
      match: /^[1-8]$/
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
