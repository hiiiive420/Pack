import SDCProgram from "../models/sdcProgram.model.js";
import Programme from "../models/Programme.js";
import Payee from "../models/Payee.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createSDCProgram = async (req, res) => {
  try {
    const { programmeId, payeeId } = req.body;

    const programme = await Programme.findById(programmeId);
    const payee = await Payee.findById(payeeId);

    if (!programme || !payee) {
      return res.status(400).json({ message: "Invalid Programme or Payee" });
    }

    const record = await SDCProgram.create({
      ...req.body,
      programmeCode: programme.code,
      programmeName: programme.name,
      payeeName: payee.name
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.SDC_PROGRAMS,
      description   : `Created SDC program record`,
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSDCPrograms = async (req, res) => {
  const records = await SDCProgram.find({ isDeleted: false })
    .sort({ date: -1 });

  res.json(records);
};

export const updateSDCProgram = async (req, res) => {
  const oldData = await SDCProgram.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Not found" });

  const updated = await SDCProgram.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.SDC_PROGRAMS,
    description   : `Updated SDC program record`,
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteSDCProgram = async (req, res) => {
  await SDCProgram.findByIdAndUpdate(req.params.id, { isDeleted: true });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.SDC_PROGRAMS,
    description   : `Deleted SDC program record`,
    recordId: req.params.id
  });

  res.json({ message: "Deleted" });
};
