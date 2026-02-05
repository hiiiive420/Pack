import mongoose from "mongoose";

const payeeAllocationSchema = new mongoose.Schema(
  {
    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payee",
      required: true
    },

    batchCode: {
      type: String,
      required: true
    },
    subjectCode: {
      type: String,
      required: true
    },
    topicCode: {
      type: String,
      required: true
    },

    ratePerHour: {
      type: Number,
      required: true
    },
    allocatedHours: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
    
  }
  ,
  { timestamps: true }
);

export default mongoose.model("PayeeAllocation", payeeAllocationSchema);
