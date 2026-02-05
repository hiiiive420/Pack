import LoanLedger from "../models/loanLedger.model.js";
import Payee from "../models/Payee.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createLoanLedger = async (req, res) => {
  try {
    const {
      payeeId,
      loanCode,
      typeOfLoan,
      payableAmount,
      paidAmount,
      noOfInstalment,
      lastInstalmentDate
    } = req.body;

    // 🔐 BASIC VALIDATION
    if (!payeeId) {
      return res.status(400).json({
        message: "Employee (Payee) is required"
      });
    }

    // 🔗 LOAD PAYEE
    const payee = await Payee.findById(payeeId).lean();
    if (!payee) {
      return res.status(400).json({
        message: "Invalid employee selected"
      });
    }

    // ✅ CORRECT SNAPSHOT MAPPING (BASED ON REAL PAYEE SCHEMA)
    const empNo = payee.payeeNumber;   // ✅ FIX
    const employeeName = payee.name;   // ✅ FIX
    const designation = payee.designation; // ✅ FIX

    if (!empNo || !employeeName || !designation) {
      return res.status(400).json({
        message: "Payee record is missing required employee details"
      });
    }

    // ✅ CREATE LEDGER RECORD
    const record = await LoanLedger.create({
      loanCode,
      typeOfLoan,
      payeeId,

      empNo,
      employeeName,
      designation,

      payableAmount,
      paidAmount,
      noOfInstalment,
      lastInstalmentDate
    });

    // 🧾 AUDIT LOG
    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.LOAN_LEDGER,
      description: "Created new loan ledger record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE LOAN LEDGER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLoanLedgers = async (req, res) => {
  const records = await LoanLedger.find({ isDeleted: false })
    .populate("payeeId", "payeeNumber name designation")
    .sort({ createdAt: -1 });

  res.json(records);
};

export const updateLoanLedger = async (req, res) => {
  const oldData = await LoanLedger.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await LoanLedger.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.LOAN_LEDGER,
    description: "Updated loan ledger record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteLoanLedger = async (req, res) => {
  await LoanLedger.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.LOAN_LEDGER,
    description: "Soft deleted loan ledger record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
