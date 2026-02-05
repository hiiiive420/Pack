import UniversityDevelopmentFund from "../models/universityDevelopmentFund.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createUDF = async (req, res) => {
  try {
    const record = await UniversityDevelopmentFund.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.UNIVERSITY_DEVELOPMENT_FUND,
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE UDF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUDFs = async (req, res) => {
  const records = await UniversityDevelopmentFund.find({ isDeleted: false })
    .sort({ date: -1 });

  res.json(records);
};

export const updateUDF = async (req, res) => {
  const oldData = await UniversityDevelopmentFund.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await UniversityDevelopmentFund.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.UNIVERSITY_DEVELOPMENT_FUND,
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteUDF = async (req, res) => {
  const record = await UniversityDevelopmentFund.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.UNIVERSITY_DEVELOPMENT_FUND,
    recordId: record._id
  });

  res.json({ message: "Record deleted" });
};
