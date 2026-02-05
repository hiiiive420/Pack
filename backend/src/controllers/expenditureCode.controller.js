import ExpenditureCode from "../models/ExpenditureCode.js";
import { logAction } from "../utils/auditLogger.js";

/* ---------------- CREATE ---------------- */
export const createExpenditureCode = async (req, res) => {
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

    const exists = await ExpenditureCode.findOne({ code });
    if (exists) {
      return res.status(400).json({
        message: "Expenditure code already exists"
      });
    }

    const expCode = await ExpenditureCode.create({ code, name });

    await logAction({
      req,
      action: "CREATE",
      module: "EXPENDITURE_CODE",
      recordId: expCode.code,
      newData: expCode,
      description: "Expenditure code created"
    });

    res.status(201).json({
      message: "Expenditure code created",
      expCode
    });
  } catch (err) {
    console.error("CREATE EXPENDITURE CODE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- GET ALL ---------------- */
export const getExpenditureCodes = async (req, res) => {
  const codes = await ExpenditureCode.find({ isActive: true }).sort({ code: 1 });
  res.json(codes);
};

/* ---------------- UPDATE ---------------- */
export const updateExpenditureCode = async (req, res) => {
  const { name } = req.body;

  const oldCode = await ExpenditureCode.findById(req.params.id).lean();

  const updated = await ExpenditureCode.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: "EXPENDITURE_CODE",
    recordId: updated.code,
    oldData: oldCode,
    newData: updated,
    description: "Expenditure code updated"
  });

  res.json(updated);
};

/* ---------------- DISABLE (SOFT DELETE) ---------------- */
export const disableExpenditureCode = async (req, res) => {
  try {
    const code = await ExpenditureCode.findById(req.params.id);

    if (!code) {
      return res.status(404).json({ message: "Expenditure code not found" });
    }

    await ExpenditureCode.findByIdAndUpdate(req.params.id, {
      isActive: false
    });

    await logAction({
      req,
      action: "DELETE",
      module: "EXPENDITURE_CODE",
      recordId: code.code,
      oldData: code,
      description: "Expenditure code disabled"
    });

    res.json({ message: "Expenditure code disabled" });
  } catch (err) {
    console.error("DISABLE EXPENDITURE CODE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
