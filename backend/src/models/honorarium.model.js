import mongoose from "mongoose";

const honorariumSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true
    },

    codeOfTheNatureOfWorks: String,
    natureOfTheWorks: String,
    nameOfTheServicePerson: String,
    detail: String,
    period: String,
    rate: String,
    amount: String,

    // ✅ REGISTER FOOTER TOTAL
    totalAmount: {
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

export default mongoose.model("Honorarium", honorariumSchema);
