import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{3}$/ // exactly 3 digits
    },
    name: {
      type: String,
      required: true
    },
    programmeCode: {
      type: String,
      required: true,
      match: /^[1-8]$/ // 1 digit
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
