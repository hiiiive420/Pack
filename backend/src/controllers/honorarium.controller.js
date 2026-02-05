import Honorarium from "../models/honorarium.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

/* CREATE */
export const createHonorarium = async (req, res) => {
  try {
    const { date, totalAmount } = req.body;

    if (!date || !totalAmount) {
      return res.status(400).json({
        message: "Date and Total Amount are required"
      });
    }

    const record = await Honorarium.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.HONORARIUM,
      description: `Created honorarium record for date ${record.date}`,
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE HONORARIUM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* READ */
export const getHonorariums = async (req, res) => {
  const records = await Honorarium.find({ isDeleted: false })
    .sort({ createdAt: -1 });

  res.json(records);
};

/* UPDATE */
export const updateHonorarium = async (req, res) => {
  const oldData = await Honorarium.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await Honorarium.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.HONORARIUM,
    description: `Updated honorarium record for date ${updated.date}`,
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

/* DELETE (SOFT) */
export const deleteHonorarium = async (req, res) => {
  const record = await Honorarium.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.HONORARIUM,
    description: `Deleted honorarium record for date ${record.date}`,
    recordId: record._id
  });

  res.json({ message: "Honorarium record deleted" });
};
