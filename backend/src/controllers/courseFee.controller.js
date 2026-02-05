import CourseFee from "../models/courseFee.model.js";
import Subject from "../models/Subject.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createCourseFee = async (req, res) => {
  try {
    const { subjectId } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(400).json({ message: "Invalid subject" });
    }

    const record = await CourseFee.create({
      ...req.body,
      courseCode: subject.subjectCode,
      courseName: subject.subjectName
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.COURSE_FEE,
      description: "Created new course fee record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCourseFees = async (req, res) => {
  const records = await CourseFee.find({ isDeleted: false })
    .sort({ date: -1 });
  res.json(records);
};

export const updateCourseFee = async (req, res) => {
  const oldData = await CourseFee.findById(req.params.id).lean();
  if (!oldData) {
    return res.status(404).json({ message: "Not found" });
  }

  const updated = await CourseFee.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.COURSE_FEE,
    description: "Updated course fee record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteCourseFee = async (req, res) => {
  await CourseFee.findByIdAndUpdate(req.params.id, { isDeleted: true });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.COURSE_FEE,
    description: "Soft deleted course fee record",
    recordId: req.params.id
  });

  res.json({ message: "Deleted" });
};
