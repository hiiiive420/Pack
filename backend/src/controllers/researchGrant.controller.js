import ResearchGrant from "../models/researchGrant.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

// CREATE
export const createResearchGrant = async (req, res) => {
  try {
    const {
  date,
  researchNumber,
  researcherName,
  expenditureType,
  approvedAmount,
  amount,
  cummulatedAmount
} = req.body;


  if (
  !date ||
  !researchNumber ||
  !researcherName ||
  !expenditureType ||
  !approvedAmount ||
  !amount ||
  !cummulatedAmount
) {
  return res.status(400).json({ message: "Required fields missing" });
}


    const record = await ResearchGrant.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.RESEARCH_GRANT,
      description: "Created new research grant record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE RESEARCH GRANT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// READ
export const getResearchGrants = async (req, res) => {
  const records = await ResearchGrant.find({ isDeleted: false })
    .sort({ createdAt: -1 });

  res.json(records);
};

// UPDATE
export const updateResearchGrant = async (req, res) => {
  const oldData = await ResearchGrant.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Record not found" });
  }

  const updated = await ResearchGrant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.RESEARCH_GRANT,
    description: "Updated research grant record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

// DELETE (SOFT)
export const deleteResearchGrant = async (req, res) => {
  await ResearchGrant.findByIdAndUpdate(req.params.id, {
    isDeleted: true
  });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.RESEARCH_GRANT,
    description: "Soft deleted research grant record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
