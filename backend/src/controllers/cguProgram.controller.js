import CGUProgram from "../models/cguProgram.model.js";
import Programme from "../models/Programme.js";
import Payee from "../models/Payee.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createCGUProgram = async (req, res) => {
  try {
    const { programmeId, payeeId } = req.body;

    const programme = await Programme.findById(programmeId);
    const payee = await Payee.findById(payeeId);

    if (!programme || !payee) {
      return res.status(400).json({ message: "Invalid Programme or Payee" });
    }

    const record = await CGUProgram.create({
      ...req.body,
      programmeCode: programme.code,
      programmeName: programme.name,
      payeeName: payee.name
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.CGU_PROGRAMS,
      description   : `Created CGU program record`,
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCGUPrograms = async (req, res) => {
  const records = await CGUProgram.find({ isDeleted: false })
    .sort({ date: -1 });

  res.json(records);
};

export const updateCGUProgram = async (req, res) => {
  const oldData = await CGUProgram.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Not found" });

  const updated = await CGUProgram.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.CGU_PROGRAMS,
    description   : `Updated CGU program record`,
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteCGUProgram = async (req, res) => {
  await CGUProgram.findByIdAndUpdate(req.params.id, { isDeleted: true });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.CGU_PROGRAMS,
    description   : `Deleted CGU program record`,
    recordId: req.params.id
  });

  res.json({ message: "Deleted" });
};
