import LedgerSheet from "../models/ledgerSheet.model.js";
import Project from "../models/Project.js";
import Payee from "../models/Payee.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createLedgerSheet = async (req, res) => {
  try {
    const {
      date,
      voucherNo,
      projectId,
      subCodeOfExpenditure,
      typeOfExpenditure,
      payeeId,
      description,
      budgetedAmount,
      expenditureAmount,
      balance,
      sign,
      remarks
    } = req.body;

    if (!date || !voucherNo || !projectId || !payeeId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // ✅ Load project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: "Invalid project selected" });
    }

    // ✅ Load payee
    const payee = await Payee.findById(payeeId);
    if (!payee) {
      return res.status(400).json({ message: "Invalid payee selected" });
    }

    const record = await LedgerSheet.create({
      date,
      voucherNo,

      projectId,
      projectCode: project.code,
      projectName: project.name,

      subCodeOfExpenditure,
      typeOfExpenditure,

      payeeId,
      payeeName: payee.name,

      description,
      budgetedAmount,
      expenditureAmount,
      balance,
      sign,
      remarks
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.LEDGER_SHEET,
      description: "Created new ledger sheet record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE LEDGER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLedgerSheets = async (req, res) => {
  const records = await LedgerSheet.find({ isDeleted: false })
    .sort({ date: -1 });

  res.json(records);
};

export const updateLedgerSheet = async (req, res) => {
  const oldData = await LedgerSheet.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Not found" });

  const updated = await LedgerSheet.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.LEDGER_SHEET,
    description: "Updated ledger sheet record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteLedgerSheet = async (req, res) => {
  await LedgerSheet.findByIdAndUpdate(req.params.id, {
    isDeleted: true
  });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.LEDGER_SHEET,
    description: "Deleted ledger sheet record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
