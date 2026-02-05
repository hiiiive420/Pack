import mongoose from "mongoose";

const foreignStudentPaymentSchema = new mongoose.Schema(
  {
    serialNo: {
      type: String,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    assistanceName: {
      type: String,
      required: true,
      trim: true
    },

    studentName: {
      type: String,
      required: true,
      trim: true
    },

    studentRegNo: {
      type: String,
      required: true,
      trim: true
    },

    amount: {
      type: String,
      required: true
    },

    sign: {
      type: String,
      enum: ["AB", "SAB"],
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
  "ForeignStudentPayment",
  foreignStudentPaymentSchema
);
