import mongoose from "mongoose";

const holidayPaymentSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    month: {
      type: String,
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

    dateOfWorking: {
      type: String,
      required: true
    },

    arrival: {
      type: String,
      required: true
    },

    departure: {
      type: String,
      required: true
    },

    basicSalary: {
      type: String,
      required: true
    },

    amount: {
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

export default mongoose.model("HolidayPayment", holidayPaymentSchema);
