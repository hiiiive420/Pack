import mongoose from "mongoose";

const loanLedgerSchema = new mongoose.Schema(
  {
    loanCode: {
      type: String,
      trim: true
    },

    typeOfLoan: {
      type: String,
      trim: true
    },

    // ✅ PAYEE REFERENCE (LIKE subjectNo)
    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payee",
      required: true
    },

    // ✅ SNAPSHOT FIELDS (AUDIT SAFE)
    employeeName: {
      type: String,
      trim: true,
      required: true
    },

    empNo: {
      type: String,
      trim: true,
      required: true
    },

    designation: {
      type: String,
      trim: true,
      required: true
    },

    payableAmount: { type: String, trim: true },
    paidAmount: { type: String, trim: true },
    noOfInstalment: { type: String, trim: true },

    lastInstalmentDate: {
      type: String // calendar (YYYY-MM-DD)
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("LoanLedger", loanLedgerSchema);
