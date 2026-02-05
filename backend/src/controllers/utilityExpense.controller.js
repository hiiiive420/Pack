import UtilityExpense from "../models/utilityExpense.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createUtilityExpense = async (req, res) => {
  try {
    const record = await UtilityExpense.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.UTILITY_EXPENSE,
      description: "Created new utility expense record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE UTILITY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUtilityExpenses = async (req, res) => {
  const records = await UtilityExpense.find({ isDeleted: false })
    .sort({ date: -1 });

  res.json(records);
};

export const updateUtilityExpense = async (req, res) => {
  const oldData = await UtilityExpense.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Record not found" });

  const updated = await UtilityExpense.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.UTILITY_EXPENSE,
    description: "Updated utility expense record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteUtilityExpense = async (req, res) => {
  await UtilityExpense.findByIdAndUpdate(req.params.id, { isDeleted: true });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.UTILITY_EXPENSE,
    description: "Soft deleted utility expense record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
