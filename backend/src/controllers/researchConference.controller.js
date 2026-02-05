import ResearchConference from "../models/researchConference.model.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createResearchConference = async (req, res) => {
  try {
    const record = await ResearchConference.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.RESEARCH_CONFERENCES,
        description   : `Created research conference record`,
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getResearchConferences = async (req, res) => {
  const records = await ResearchConference.find({ isDeleted: false })
    .sort({ date: -1 });

  res.json(records);
};

export const updateResearchConference = async (req, res) => {
  const oldData = await ResearchConference.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Not found" });

  const updated = await ResearchConference.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.RESEARCH_CONFERENCES,
    description   : `Updated research conference record`,
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteResearchConference = async (req, res) => {
  await ResearchConference.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.RESEARCH_CONFERENCES,
    description   : `Deleted research conference record`,
    recordId: req.params.id
  });

  res.json({ message: "Deleted" });
};
