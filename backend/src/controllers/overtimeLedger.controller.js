import OvertimeLedger from "../models/overtimeLedger.model.js";
import Payee from "../models/Payee.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createOvertimeLedger = async (req, res) => {
  try {
    const {
      date,
      month,
      payeeId,
      approvedHours,
      workedHours,
      paidHours,
      rate,
      amount
    } = req.body;

    if (!date || !month || !payeeId) {
      return res.status(400).json({
        message: "Date, Month and Employee are required"
      });
    }

    const payee = await Payee.findById(payeeId).lean();
    if (!payee) {
      return res.status(400).json({ message: "Invalid employee selected" });
    }

    const record = await OvertimeLedger.create({
      date,
      month,
      payeeId,

      empNo: payee.payeeNumber,   // ✅ correct
      employeeName: payee.name,   // ✅ correct

      approvedHours,
      workedHours,
      paidHours,
      rate,
      amount
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.OVERTIME_LEDGER,
      description: "Created new overtime ledger record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE OVERTIME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOvertimeLedgers = async (req, res) => {
  const records = await OvertimeLedger.find({ isDeleted: false })
    .populate("payeeId", "payeeNumber name")
    .sort({ createdAt: -1 });

  res.json(records);
};

export const updateOvertimeLedger = async (req, res) => {
  const oldData = await OvertimeLedger.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await OvertimeLedger.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.OVERTIME_LEDGER,
    description: "Updated overtime ledger record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteOvertimeLedger = async (req, res) => {
  await OvertimeLedger.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.OVERTIME_LEDGER,
    description: "Soft deleted overtime ledger record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
