import ConstructionPayment from "../models/constructionPayment.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createConstructionPayment = async (req, res) => {
  try {
    const record = await ConstructionPayment.create({
      contractCode: req.body.contractCode,
      contractName: req.body.contractName,

      contractorName: req.body.contractorName,
      contractorAddress: req.body.contractorAddress,
      contractorContactNo: req.body.contractorContactNo,

      contractSum: req.body.contractSum,
      retention: req.body.retention,
      contractPeriod: req.body.contractPeriod,
      vatNo: req.body.vatNo,
      mobilizationAdvance: req.body.mobilizationAdvance,
      performanceBond: req.body.performanceBond,

      date: req.body.date,
      description: req.body.description,

      amountExcludingVAT: req.body.amountExcludingVAT,
      retentionAmount: req.body.retentionAmount,
      vatAmount: req.body.vatAmount,

      voucherAmountIncludingVAT: req.body.voucherAmountIncludingVAT,
      cumulativeAmount: req.body.cumulativeAmount,

      ma: req.body.ma,
      paymentType: req.body.paymentType // ✅ IMPORTANT
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.CONSTRUCTION_PAYMENTS,
      description: "Created new construction payment record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE CONSTRUCTION PAYMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConstructionPayments = async (req, res) => {
  const records = await ConstructionPayment.find({ isDeleted: false })
    .sort({ createdAt: -1 });

  res.json(records);
};

export const updateConstructionPayment = async (req, res) => {
  const oldData = await ConstructionPayment.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await ConstructionPayment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.CONSTRUCTION_PAYMENTS,
    description: "Updated construction payment record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteConstructionPayment = async (req, res) => {
  await ConstructionPayment.findByIdAndUpdate(req.params.id, {
    isDeleted: true
  });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.CONSTRUCTION_PAYMENTS,
    description: "Deleted construction payment record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
