import HolidayPayment from "../models/holidayPayment.model.js";
import Payee from "../models/Payee.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createHolidayPayment = async (req, res) => {
  try {
    const {
      date,
      month,
      payeeId,
      dateOfWorking,
      arrival,
      departure,
      basicSalary,
      amount
    } = req.body;

    // 🔐 REQUIRED FIELD VALIDATION
    if (
      !date ||
      !month ||
      !payeeId ||
      !dateOfWorking ||
      !arrival ||
      !departure ||
      !basicSalary ||
      !amount
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const payee = await Payee.findById(payeeId).lean();
    if (!payee) {
      return res.status(400).json({
        message: "Invalid employee selected"
      });
    }

    const record = await HolidayPayment.create({
      date,
      month,
      payeeId,

      empNo: payee.payeeNumber,
      employeeName: payee.name,

      dateOfWorking,
      arrival,
      departure,
      basicSalary,
      amount
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.HOLIDAY_PAYMENT,
      description: "Created new holiday payment record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE HOLIDAY PAYMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getHolidayPayments = async (req, res) => {
  const records = await HolidayPayment.find({ isDeleted: false })
    .populate("payeeId", "payeeNumber name")
    .sort({ createdAt: -1 });

  res.json(records);
};

export const updateHolidayPayment = async (req, res) => {
  const oldData = await HolidayPayment.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Record not found" });

  const updated = await HolidayPayment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.HOLIDAY_PAYMENT,
    description: "Updated holiday payment record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteHolidayPayment = async (req, res) => {
  await HolidayPayment.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.HOLIDAY_PAYMENT,
    description: "Soft deleted holiday payment record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
