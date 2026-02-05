import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    topicCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    topicName: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Topic", topicSchema);
