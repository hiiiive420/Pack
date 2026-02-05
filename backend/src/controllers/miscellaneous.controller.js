import Miscellaneous from "../models/miscellaneous.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

// CREATE
export const createMiscellaneous = async (req, res) => {
  try {
    const {
      date,
      expenditureCode,
      expenditureType,
      amount
    } = req.body;

    if (!date || !expenditureCode || !expenditureType || !amount) {
      return res.status(400).json({
        message: "Date, Code, Type and Amount are required"
      });
    }

    const record = await Miscellaneous.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.MISCELLANEOUS,
      description: "Created new miscellaneous record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE MISC ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// READ
export const getMiscellaneous = async (req, res) => {
  const records = await Miscellaneous.find({ isDeleted: false })
    .sort({ createdAt: -1 });

  res.json(records);
};

// UPDATE
export const updateMiscellaneous = async (req, res) => {
  const oldData = await Miscellaneous.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await Miscellaneous.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.MISCELLANEOUS,
    description: "Updated miscellaneous record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

// DELETE (SOFT)
export const deleteMiscellaneous = async (req, res) => {
  await Miscellaneous.findByIdAndUpdate(req.params.id, {
    isDeleted: true
  });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.MISCELLANEOUS,
    description: "Soft deleted miscellaneous record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
