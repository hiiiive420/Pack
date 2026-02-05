import Department from "../models/Department.js";
import Project from "../models/Project.js";
import { logAction } from "../utils/auditLogger.js";

// CREATE DEPARTMENT
export const createDepartment = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { programmeCode, projectCode, code, name } = req.body;
    

    if (!programmeCode || !projectCode || !code || !name) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Project must exist & active
    const project = await Project.findOne({
      code: projectCode,
      programmeCode,
      isActive: true
    });

    if (!project) {
      return res.status(400).json({
        message: "Project not found or inactive"
      });
    }

    // Code must start with project code
    if (!code.startsWith(projectCode)) {
      return res.status(400).json({
        message: "Department code must start with project code"
      });
    }

    const exists = await Department.findOne({ code });
    if (exists) {
      return res.status(400).json({
        message: "Department already exists"
      });
    }

    const department = await Department.create({
      code,
      name,
      projectCode,
      programmeCode
    });
    await logAction({
  req,
  action: "CREATE",
  module: "DEPARTMENT",
  recordId: department.code,
  newData: department,
  description: "Department created"
});

    res.status(201).json({
      message: "Department created",
      department
    });
  } catch (err) {
    console.error("CREATE DEPARTMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET DEPARTMENTS (BY PROJECT)
export const getDepartments = async (req, res) => {
  const { projectCode } = req.query;

  const filter = {
    isActive: true,
    ...(projectCode && { projectCode })
  };

  const departments = await Department.find(filter).sort({ code: 1 });
  res.json(departments);
};

// UPDATE DEPARTMENT (NAME ONLY)
export const updateDepartment = async (req, res) => {
  const { name } = req.body;
  const oldDept = await Department.findById(req.params.id).lean();

  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true }
  );
  await logAction({
  req,
  action: "UPDATE",
  module: "DEPARTMENT",
  recordId: department.code,
  oldData: oldDept,
  newData: department,
  description: "Department updated"
});

  res.json(department);
};

// DISABLE DEPARTMENT
// DISABLE DEPARTMENT (SOFT DELETE)
export const disableDepartment = async (req, res) => {
  try {
    // 1️⃣ Fetch existing department (for logging)
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // 2️⃣ Soft delete
    department.isActive = false;
    await department.save();

    // 3️⃣ Audit log
    await logAction({
      req,
      action: "DELETE",
      module: "DEPARTMENT",
      recordId: department.code,
      oldData: department,
      description: "Department disabled"
    });

    res.json({ message: "Department disabled" });
  } catch (err) {
    console.error("DISABLE DEPARTMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


