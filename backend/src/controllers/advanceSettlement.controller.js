import AdvanceSettlement from "../models/advanceSettlement.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

// CREATE
export const createAdvanceSettlement = async (req, res) => {
  try {
    const {
      date,
      voucherNo,
      name,
      purpose,
      advanceAmount
    } = req.body;

    if (!date || !voucherNo || !name || !purpose || !advanceAmount) {
      return res.status(400).json({
        message: "All advance fields are required"
      });
    }

    const record = await AdvanceSettlement.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.ADVANCE_SETTLEMENT,
      description: "Created new advance settlement record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// READ
export const getAdvanceSettlements = async (req, res) => {
  const records = await AdvanceSettlement.find({ isDeleted: false })
    .sort({ createdAt: -1 });

  res.json(records);
};

// UPDATE (Advance or Settlement later)
export const updateAdvanceSettlement = async (req, res) => {
  const oldData = await AdvanceSettlement.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await AdvanceSettlement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.ADVANCE_SETTLEMENT,
    description: "Updated advance settlement record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

// DELETE (SOFT)
export const deleteAdvanceSettlement = async (req, res) => {
  await AdvanceSettlement.findByIdAndUpdate(req.params.id, {
    isDeleted: true
  });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.ADVANCE_SETTLEMENT,
    description: "Soft deleted advance settlement record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
