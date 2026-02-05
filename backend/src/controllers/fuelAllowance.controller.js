import FuelAllowance from "../models/fuelAllowance.model.js";
import Payee from "../models/Payee.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createFuelAllowance = async (req, res) => {
  try {
    const {
      date,
      month,
      payeeId,
      approvedLiterPerMonth,
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

    const record = await FuelAllowance.create({
      date,
      month,
      payeeId,
      empNo: payee.payeeNumber,   // ✅ FROM PAYEE
      employeeName: payee.name,   // ✅ FROM PAYEE
      approvedLiterPerMonth,
      rate,
      amount
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.FUEL_ALLOWANCE,
      description: "Created new fuel allowance record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE FUEL ALLOWANCE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFuelAllowances = async (req, res) => {
  const records = await FuelAllowance.find({ isDeleted: false })
    .populate("payeeId", "payeeNumber name")
    .sort({ createdAt: -1 });

  res.json(records);
};

export const updateFuelAllowance = async (req, res) => {
  const oldData = await FuelAllowance.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await FuelAllowance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.FUEL_ALLOWANCE,
    description: "Updated fuel allowance record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteFuelAllowance = async (req, res) => {
  await FuelAllowance.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.FUEL_ALLOWANCE,
    description: "Soft deleted fuel allowance record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
