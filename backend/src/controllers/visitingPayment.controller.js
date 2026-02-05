import VisitingPayment from "../models/visitingPayment.model.js";
import Project from "../models/Project.js";
import Subject from "../models/Subject.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

/* ================= CREATE ================= */
export const createVisitingPayment = async (req, res) => {
  try {
    const { projectId, subjectId, appointmentNo, appointmentDate, rows } =
      req.body;

    if (!projectId || !subjectId || !appointmentNo || !appointmentDate) {
      return res.status(400).json({
        message: "Project, Subject, Appointment No & Date are required"
      });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        message: "At least one monthly row is required"
      });
    }

    const project = await Project.findById(projectId).lean();
    const subject = await Subject.findById(subjectId).lean();

    if (!project || !subject) {
      return res.status(400).json({
        message: "Invalid Project or Subject"
      });
    }

    const record = await VisitingPayment.create({
      ...req.body,
      projectCode: project.code,
      projectName: project.name,
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.VISITING_PAYMENT,
      description: "Created new visiting payment record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE VISITING PAYMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= READ ================= */
export const getVisitingPayments = async (req, res) => {
  const records = await VisitingPayment.find({ isDeleted: false })
    .sort({ createdAt: -1 });

  res.json(records);
};

/* ================= UPDATE ================= */
export const updateVisitingPayment = async (req, res) => {
  const oldData = await VisitingPayment.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Not found" });

  const updated = await VisitingPayment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.VISITING_PAYMENT,
    description: "Updated visiting payment record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

/* ================= DELETE ================= */
export const deleteVisitingPayment = async (req, res) => {
  await VisitingPayment.findByIdAndUpdate(req.params.id, {
    isDeleted: true
  });

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.VISITING_PAYMENT,
    description: "Soft deleted visiting payment record",
    recordId: req.params.id
  });

  res.json({ message: "Deleted" });
};
