import Batch from "../models/Batch.js";
import { logAction } from "../utils/auditLogger.js";

// CREATE BATCH
export const createBatch = async (req, res) => {
  try {
    const { startYear, endYear } = req.body;

    if (!startYear || !endYear) {
      return res.status(400).json({
        message: "Start year and end year are required"
      });
    }

    if (endYear <= startYear) {
      return res.status(400).json({
        message: "End year must be greater than start year"
      });
    }

    const exists = await Batch.findOne({
      startYear,
      endYear
    });

    if (exists) {
      return res.status(400).json({
        message: "Batch already exists"
      });
    }

    const batch = await Batch.create({ startYear, endYear });

    res.status(201).json({
      message: "Batch created",
      batch
    });
  } catch (err) {
    console.error("CREATE BATCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET BATCHES
export const getBatches = async (req, res) => {
  const batches = await Batch.find({ isActive: true }).sort({
    startYear: -1
  });
  res.json(batches);
};

// UPDATE BATCH (YEARS ONLY)
export const updateBatch = async (req, res) => {
  const { startYear, endYear } = req.body;
  if (endYear <= startYear) {
    return res.status(400).json({ message: "Invalid duration" });
  }

  const oldBatch = await Batch.findById(req.params.id).lean();

  const start = startYear.toString().slice(-2);
  const end = endYear.toString().slice(-2);

  const batch = await Batch.findByIdAndUpdate(
    req.params.id,
    {
      startYear,
      endYear,
      batchCode: `${start}-${end}`,
      batchName: `${startYear}-${endYear} Batch`
    },
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: "BATCH",
    recordId: batch.batchCode,
    oldData: oldBatch,
    newData: batch,
    description: "Batch updated"
  });

  res.json(batch);
};


// DISABLE BATCH
export const disableBatch = async (req, res) => {
  const batch = await Batch.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: "BATCH",
    recordId: batch.batchCode,
    description: "Batch disabled"
  });

  res.json({ message: "Batch disabled" });
};
