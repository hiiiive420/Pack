import RepairServicePayment from "../models/repairServicePayment.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createRepairServicePayment = async (req, res) => {
  try {
    const record = await RepairServicePayment.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.REPAIR_SERVICE_PAYMENTS,
      description   : `Created repair/service payment record`,
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRepairServicePayments = async (req, res) => {
  const records = await RepairServicePayment.find({ isDeleted: false })
    .sort({ date: -1 });

  res.json(records);
};

export const updateRepairServicePayment = async (req, res) => {
  const oldData = await RepairServicePayment.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Not found" });

  const updated = await RepairServicePayment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.REPAIR_SERVICE_PAYMENTS,
    description   : `Updated repair/service payment record`,
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteRepairServicePayment = async (req, res) => {
  await RepairServicePayment.findByIdAndUpdate(req.params.id, {
    isDeleted: true
  });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.REPAIR_SERVICE_PAYMENTS,
    description   : `Deleted repair/service payment record`,
    recordId: req.params.id
  });

  res.json({ message: "Deleted" });
};
