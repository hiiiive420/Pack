import Subject from "../models/Subject.js";
import { logAction } from "../utils/auditLogger.js";

// CREATE SUBJECT
export const createSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName } = req.body;

    if (!subjectCode || !subjectName) {
      return res.status(400).json({
        message: "Subject code and name are required"
      });
    }

    const exists = await Subject.findOne({ subjectCode });
    if (exists) {
      return res.status(400).json({
        message: "Subject already exists"
      });
    }

    const subject = await Subject.create({ subjectCode, subjectName });

    await logAction({
      req,
      action: "CREATE",
      module: "SUBJECT",
      recordId: subject.subjectCode,
      newData: subject,
      description: "Subject created"
    });

    res.status(201).json({ message: "Subject created", subject });
  } catch (err) {
    console.error("CREATE SUBJECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET SUBJECTS (RESTORED)
export const getSubjects = async (req, res) => {
  const subjects = await Subject.find({ isActive: true }).sort({
    subjectCode: 1
  });
  res.json(subjects);
};

// UPDATE SUBJECT
export const updateSubject = async (req, res) => {
  const { subjectName } = req.body;

  const oldSubject = await Subject.findById(req.params.id).lean();

  const subject = await Subject.findByIdAndUpdate(
    req.params.id,
    { subjectName },
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: "SUBJECT",
    recordId: subject.subjectCode,
    oldData: oldSubject,
    newData: subject,
    description: "Subject updated"
  });

  res.json(subject);
};

// DISABLE SUBJECT
export const disableSubject = async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: "SUBJECT",
    recordId: subject.subjectCode,
    description: "Subject disabled"
  });

  res.json({ message: "Subject disabled" });
};
