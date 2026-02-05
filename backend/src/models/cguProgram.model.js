import mongoose from "mongoose";

const cguProgramSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },

    programmeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: true
    },
    programmeCode: String,
    programmeName: String,

    typeOfExpenditure: {
      type: String,
      required: true,
      trim: true
    },

    approvedBudget: {
      type: String,
      required: true
    },

    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payee",
      required: true
    },
    payeeName: String,

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

export default mongoose.model("CGUProgram", cguProgramSchema);
