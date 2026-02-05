import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    startYear: {
      type: Number,
      required: true
    },
    endYear: {
      type: Number,
      required: true
    },
    batchCode: {
      type: String,
      unique: true
    },
    batchName: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// ✅ FIXED: no `next`
batchSchema.pre("save", function () {
  const start = this.startYear.toString().slice(-2);
  const end = this.endYear.toString().slice(-2);

  this.batchCode = `${start}-${end}`;
  this.batchName = `${this.startYear}-${this.endYear} Batch`;
});

export default mongoose.model("Batch", batchSchema);
