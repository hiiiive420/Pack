import ElectricalMeter from "../models/ElectricalMeter.js";
import Department from "../models/Department.js";
import Project from "../models/Project.js";
import { logAction } from "../utils/auditLogger.js";

/* =========================================
   CREATE ELECTRICAL METER
========================================= */
export const createMeter = async (req, res) => {
  try {
    const {
      meterNo,
      projectCode,
      departmentCode,
      building,
      ownership,
      vote,
      sourceOfFund
    } = req.body;

    // 🔐 Validation (Trust nothing)
    if (!meterNo || !projectCode || !departmentCode || !building || !ownership || !vote) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 🔐 Verify project exists
    const project = await Project.findOne({ code: projectCode, isActive: true });
    if (!project) {
      return res.status(400).json({ message: "Invalid project code" });
    }

    // 🔐 Verify department belongs to project
    const department = await Department.findOne({
      code: departmentCode,
      projectCode,
      isActive: true
    });

    if (!department) {
      return res.status(400).json({
        message: "Department does not belong to selected project"
      });
    }

    // 🔐 Prevent duplicate meter
    const exists = await ElectricalMeter.findOne({ meterNo });
    if (exists) {
      return res.status(400).json({ message: "Meter already exists" });
    }

    const meter = await ElectricalMeter.create({
      meterNo: meterNo.trim(),
      projectCode,
      departmentCode,
      building: building.trim(),
      ownership: ownership.trim(),
      vote: vote.trim(),
      sourceOfFund: sourceOfFund?.trim() || null
    });

    await logAction({
      req,
      action: "CREATE",
      module: "ELECTRICAL_METER",
      recordId: meter.meterNo,
      newData: meter,
      description: "Electrical meter created"
    });

    res.status(201).json({
      message: "Meter created successfully",
      meter
    });
  } catch (err) {
    console.error("CREATE METER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMeters = async (req, res) => {
  const meters = await ElectricalMeter.find({ isActive: true }).sort({
    createdAt: -1
  });
  res.json(meters);
};

export const updateMeter = async (req, res) => {
  try {
    const oldMeter = await ElectricalMeter.findById(req.params.id).lean();
    if (!oldMeter) {
      return res.status(404).json({ message: "Meter not found" });
    }

    const meter = await ElectricalMeter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    await logAction({
      req,
      action: "UPDATE",
      module: "ELECTRICAL_METER",
      recordId: meter.meterNo,
      oldData: oldMeter,
      newData: meter,
      description: "Electrical meter updated"
    });

    res.json(meter);
  } catch (err) {
    console.error("UPDATE METER ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

export const disableMeter = async (req, res) => {
  const meter = await ElectricalMeter.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (meter) {
    await logAction({
      req,
      action: "DELETE",
      module: "ELECTRICAL_METER",
      recordId: meter.meterNo,
      description: "Electrical meter disabled"
    });
  }

  res.json({ message: "Meter disabled" });
};
