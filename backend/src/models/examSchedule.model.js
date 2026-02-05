import mongoose from "mongoose";

const examScheduleSchema = new mongoose.Schema(
  {
    examNo: { type: String, required: true, trim: true },
    expCode: { type: String, trim: true },
    seN: { type: String, trim: true },
    title: { type: String, trim: true },
    name: { type: String, trim: true },

    subjectNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    natureOfTheExamWorks: { type: String, trim: true },
    period: { type: String, trim: true },
    rate: { type: String, trim: true },
    claimAmount: { type: String, trim: true },
    total: { type: String, trim: true },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("ExamSchedule", examScheduleSchema);
