import Programme from "../models/Programme.js";
import { logAction } from "../utils/auditLogger.js";


// CREATE PROGRAMME
export const createProgramme = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { code, name } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        message: "Code and name are required"
      });
    }

    // ❌ Rule: Programme 6 not allowed
    if (code === "6") {
      return res.status(400).json({
        message: "Programme code 6 is not available"
      });
    }

    const exists = await Programme.findOne({ code });
    if (exists) {
      return res.status(400).json({
        message: "Programme already exists"
      });
    }

    const programme = await Programme.create({ code, name });
    await logAction({
  req,
  action: "CREATE",
  module: "PROGRAMME",
  recordId: programme.code,
  newData: programme,
  description: "Programme created"
});

    res.status(201).json({
      message: "Programme created",
      programme
    });
  } catch (err) {
    console.error("CREATE PROGRAMME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL PROGRAMMES
export const getProgrammes = async (req, res) => {
  const programmes = await Programme.find({ isActive: true }).sort({ code: 1 });
  res.json(programmes);
};

// UPDATE PROGRAMME
export const updateProgramme = async (req, res) => {
  const { name } = req.body;
const oldProgramme = await Programme.findById(req.params.id).lean();
  const programme = await Programme.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true }
  );
await logAction({
  req,
  action: "UPDATE",
  module: "PROGRAMME",
  recordId: programme.code,
  oldData: oldProgramme,
  newData: programme,
  description: "Programme updated"
});
  res.json(programme);
};

// DISABLE PROGRAMME (SOFT DELETE)
// DISABLE PROGRAMME (SOFT DELETE)
export const disableProgramme = async (req, res) => {
  try {
    // 1️⃣ Get existing programme (for audit log)
    const programme = await Programme.findById(req.params.id);

    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // 2️⃣ Soft delete
    await Programme.findByIdAndUpdate(req.params.id, {
      isActive: false
    });

    // 3️⃣ Audit log
    await logAction({
      req,
      action: "DELETE",
      module: "PROGRAMME",
      recordId: programme.code,
      oldData: programme,
      description: "Programme disabled"
    });

    res.json({ message: "Programme disabled" });
  } catch (err) {
    console.error("DISABLE PROGRAMME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

