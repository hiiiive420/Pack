import mongoose from "mongoose";

const payeeSchema = new mongoose.Schema(
  {
    payeeType: {
      type: String,
      enum: ["INTERNAL", "EXTERNAL"],
      required: true
    },
    payeeNumber: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    telephone: {
      type: String,
      required: true
    },// ✅ NEW FIELDS
    appointmentNo: {
      type: String,
      required: true
    },
    appointmentDate: {
      type: Date,
      required: true
    },

    departmentCode: {
      type: String,
      required: true
    },

    contractStartDate: {
      type: Date,
      required: true
    },
    contractEndDate: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Payee", payeeSchema);
