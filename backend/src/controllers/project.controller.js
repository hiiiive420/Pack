import Project from "../models/Project.js";
import Programme from "../models/Programme.js";
import { logAction } from "../utils/auditLogger.js";

// CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { code, name, programmeCode } = req.body;

    if (!code || !name || !programmeCode) {
      return res.status(400).json({
        message: "Code, name and programme are required"
      });
    }

    const programme = await Programme.findOne({
      code: programmeCode,
      isActive: true
    });

    if (!programme) {
      return res.status(400).json({
        message: "Programme not found or inactive"
      });
    }

    if (!code.startsWith(programmeCode)) {
      return res.status(400).json({
        message: "Project code must start with programme code"
      });
    }

    const exists = await Project.findOne({ code });
    if (exists) {
      return res.status(400).json({
        message: "Project already exists"
      });
    }

    const project = await Project.create({
      code,
      name,
      programmeCode
    });

    await logAction({
      req,
      action: "CREATE",
      module: "PROJECT",
      recordId: project.code,
      newData: project,
      description: "Project created"
    });

    res.status(201).json({
      message: "Project created",
      project
    });
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET PROJECTS (RESTORED)
export const getProjects = async (req, res) => {
  const { programmeCode } = req.query;

  const filter = {
    isActive: true,
    ...(programmeCode && { programmeCode })
  };

  const projects = await Project.find(filter).sort({ code: 1 });
  res.json(projects);
};

// UPDATE PROJECT
export const updateProject = async (req, res) => {
  const { name } = req.body;

  const oldProject = await Project.findById(req.params.id).lean();

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: "PROJECT",
    recordId: project.code,
    oldData: oldProject,
    newData: project,
    description: "Project updated"
  });

  res.json(project);
};

// DISABLE PROJECT
export const disableProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: "PROJECT",
    recordId: project.code,
    description: "Project disabled"
  });

  res.json({ message: "Project disabled" });
};
