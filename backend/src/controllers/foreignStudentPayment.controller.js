import ForeignStudentPayment from "../models/foreignStudentPayment.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createForeignStudentPayment = async (req, res) => {
  try {
    const record = await ForeignStudentPayment.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.FOREIGN_STUDENTS_PAYMENT,
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getForeignStudentPayments = async (req, res) => {
  const records = await ForeignStudentPayment.find({ isDeleted: false })
    .sort({ date: -1 });

  res.json(records);
};

export const updateForeignStudentPayment = async (req, res) => {
  const oldData = await ForeignStudentPayment.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Not found" });

  const updated = await ForeignStudentPayment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.FOREIGN_STUDENTS_PAYMENT,
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteForeignStudentPayment = async (req, res) => {
  await ForeignStudentPayment.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.FOREIGN_STUDENTS_PAYMENT,
    recordId: req.params.id
  });

  res.json({ message: "Deleted" });
};
