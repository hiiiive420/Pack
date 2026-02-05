import ExamSchedule from "../models/examSchedule.model.js";
import Subject from "../models/Subject.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";


export const createExamSchedule = async (req, res) => {
  try {
    const {
      examNo,
      expCode,
      seN,
      title,
      name,
      subjectNo,
      natureOfTheExamWorks,
      period,
      rate,
      claimAmount,
      total
    } = req.body;

    if (!examNo || !subjectNo) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const subject = await Subject.findById(subjectNo);
    if (!subject) {
      return res.status(400).json({ message: "Invalid subject" });
    }

    const exam = await ExamSchedule.create(req.body);

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.EXAM_SCHEDULE,
      description: `Created exam schedule ${exam.examNo}`,
      recordId: exam._id,
      newData: exam
    });

    res.status(201).json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getExamSchedules = async (req, res) => {
  const exams = await ExamSchedule.find({ isDeleted: false })
    .populate("subjectNo", "subjectCode subjectName")
    .sort({ createdAt: -1 });

  res.json(exams);
};

export const updateExamSchedule = async (req, res) => {
  const oldData = await ExamSchedule.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Not found" });

  const updated = await ExamSchedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.EXAM_SCHEDULE,
    description: `Updated exam schedule ${updated.examNo}`,
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteExamSchedule = async (req, res) => {
  const exam = await ExamSchedule.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.EXAM_SCHEDULE,
    description: `Deleted exam schedule ${exam.examNo}`,
    recordId: exam._id
  });

  res.json({ message: "Record deleted" });
};
