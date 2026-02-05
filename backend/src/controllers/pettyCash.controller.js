import PettyCash from "../models/pettyCash.model.js";
import Department from "../models/Department.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

// CREATE
export const createPettyCash = async (req, res) => {
  try {
    const {
      date,
      departmentId,
      approvedAmount,
      description,
      expenseAmount,
      balanceAmount
    } = req.body;

    if (
      !date ||
      !departmentId ||
      !approvedAmount ||
      !expenseAmount ||
      !balanceAmount
    ) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    const department = await Department.findById(departmentId).lean();
    if (!department || !department.isActive) {
      return res.status(400).json({
        message: "Invalid department selected"
      });
    }

    const record = await PettyCash.create({
      date,
      departmentId,
      departmentCode: department.code,
      departmentName: department.name,
      approvedAmount,
      description,
      expenseAmount,
      balanceAmount
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.PETTY_CASH,
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE PETTY CASH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// READ
export const getPettyCash = async (req, res) => {
  const records = await PettyCash.find({ isDeleted: false })
    .sort({ createdAt: -1 });

  res.json(records);
};

// UPDATE
export const updatePettyCash = async (req, res) => {
  const oldData = await PettyCash.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await PettyCash.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.PETTY_CASH,
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

// DELETE (SOFT)
export const deletePettyCash = async (req, res) => {
  await PettyCash.findByIdAndUpdate(req.params.id, {
    isDeleted: true
  });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.PETTY_CASH,
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
