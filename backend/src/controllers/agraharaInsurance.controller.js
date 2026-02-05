import AgraharaInsurance from "../models/agraharaInsurance.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createAgraharaInsurance = async (req, res) => {
  try {
    const record = await AgraharaInsurance.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.AGAHARA_INSURANCE,
      description: "Created new agrahara insurance record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE AGAHARA ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAgraharaInsurances = async (req, res) => {
  const records = await AgraharaInsurance.find({ isDeleted: false })
    .sort({ date: -1 });

  res.json(records);
};

export const updateAgraharaInsurance = async (req, res) => {
  const oldData = await AgraharaInsurance.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await AgraharaInsurance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.AGAHARA_INSURANCE,
    description: "Updated agrahara insurance record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteAgraharaInsurance = async (req, res) => {
  const record = await AgraharaInsurance.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.AGAHARA_INSURANCE,
    description: "Soft deleted agrahara insurance record",
    recordId: record._id
  });

  res.json({ message: "Record deleted" });
};
