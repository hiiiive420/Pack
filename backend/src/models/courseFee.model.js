import mongoose from "mongoose";

const courseFeeSchema = new mongoose.Schema(
  {
    /* 🔗 SUBJECT */
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    courseCode: {
      type: String,
      required: true
    },
    courseName: {
      type: String,
      required: true
    },

    /* ===== MANUAL FIELDS ===== */
    date: {
      type: Date,
      required: true
    },

    staffName: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    approvedBudgetAmount: {
      type: String,
      required: true
    },

    paidAmount: {
      type: String,
      required: true
    },

    balanceAmount: {
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

export default mongoose.model("CourseFee", courseFeeSchema);
