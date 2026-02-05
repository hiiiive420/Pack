import mongoose from "mongoose";

/* ================= ROW ================= */
const visitingRowSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    month: { type: String, required: true },

    lecHrs: String,
    lecAmount: String,

    praHrs: String,
    praAmount: String,

    balanceLecHrs: String,
    balancePraHrs: String,

    travelling: String,
    totalAmount: String,
    deduction10: String,
    netAmount: String
  },
  { _id: false }
);

/* ================= MAIN ================= */
const visitingPaymentSchema = new mongoose.Schema(
  {
    /* 🔗 FACULTY (PROJECT) */
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    projectCode: { type: String, required: true },
    projectName: { type: String, required: true },

    /* 🔗 SUBJECT */
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },

    /* ===== HEADER (MANUAL) ===== */
    name: { type: String, required: true },
    address: { type: String, required: true },

    appointmentNo: { type: String, required: true },
    appointmentDate: { type: Date, required: true },

    expenditureCode: String,

    visitingHrs: String,
    practicalHrs: String,

    visitingRate: String,
    practicalRate: String,

    /* ===== MONTHLY ROWS ===== */
    rows: {
      type: [visitingRowSchema],
      validate: v => Array.isArray(v) && v.length > 0
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("VisitingPayment", visitingPaymentSchema);
