import Payee from "../models/Payee.js";
import PayeeAllocation from "../models/PayeeAllocation.js";
import { logAction } from "../utils/auditLogger.js";



/* =====================================================
   CREATE PAYEE + ALLOCATIONS
===================================================== */
export const createPayee = async (req, res) => {
  try {
    const {
      payeeType,
      payeeNumberDigits,
      name,
      designation,
      address,
      telephone,
      appointmentNo,
      appointmentDate,
      departmentCode,
      contractStartDate,
      contractEndDate,
      allocations
    } = req.body;

    // ---------- VALIDATION ----------
    if (
      !payeeType ||
      !payeeNumberDigits ||
      !name ||
      !designation ||
      !address ||
      !telephone ||
      !appointmentNo ||
      !appointmentDate ||
      !departmentCode ||
      !contractStartDate ||
      !contractEndDate
    ) {
      return res.status(400).json({
        message: "All payee fields are required"
      });
    }

    if (!["INTERNAL", "EXTERNAL"].includes(payeeType)) {
      return res.status(400).json({ message: "Invalid payee type" });
    }

    if (!/^\d{5}$/.test(payeeNumberDigits)) {
      return res.status(400).json({
        message: "Payee number must be exactly 5 digits"
      });
    }

    const prefix = payeeType === "INTERNAL" ? "I" : "E";
    const payeeNumber = `${prefix}${payeeNumberDigits}`;

    const exists = await Payee.findOne({ payeeNumber });
    if (exists) {
      return res.status(400).json({
        message: "Payee number already exists"
      });
    }

    if (new Date(contractEndDate) <= new Date(contractStartDate)) {
      return res.status(400).json({
        message: "Invalid contract duration"
      });
    }

    // ---------- CREATE PAYEE ----------
    const payee = await Payee.create({
      payeeType,
      payeeNumber,
      name,
      designation,
      address,
      telephone,
      appointmentNo,
  appointmentDate,
      departmentCode,
      contractStartDate,
      contractEndDate
    });

    // ---------- CREATE ALLOCATIONS ----------
    if (Array.isArray(allocations) && allocations.length > 0) {
      const allocationDocs = allocations.map((a) => ({
        payeeId: payee._id,
        batchCode: a.batchCode,
        subjectCode: a.subjectCode,
        topicCode: a.topicCode,
        ratePerHour: a.ratePerHour,
        allocatedHours: a.allocatedHours
      }));

      await PayeeAllocation.insertMany(allocationDocs);
    }
// ✅ ADD THIS JUST BEFORE res.status(201).json(...)
await logAction({
  req,
  action: "CREATE",
  module: "PAYEE",
  recordId: payee.payeeNumber,
  newData: payee,
  description: "Payee created"
});

    res.status(201).json({
      message: "Payee created successfully",
      payee
    });
  } catch (err) {
    console.error("CREATE PAYEE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET PAYEES
===================================================== */
export const getPayees = async (req, res) => {
  const payees = await Payee.find({ isActive: true }).sort({
    createdAt: -1
  });
  res.json(payees);
};

/* =====================================================
   GET PAYEE ALLOCATIONS
===================================================== */
export const getPayeeAllocations = async (req, res) => {
  const allocations = await PayeeAllocation.find({
    payeeId: req.params.payeeId,
    isActive: true
  });
  res.json(allocations);
};

/* =====================================================
   UPDATE PAYEE + ALLOCATIONS (FIXED)
===================================================== */
export const updatePayee = async (req, res) => {
  try {
    const {
      payeeType,
      payeeNumberDigits,
      name,
      designation,
      address,
      telephone,
      appointmentNo,
  appointmentDate,
      departmentCode,
      contractStartDate,
      contractEndDate,
      allocations
    } = req.body;

    // ---------- PAYEE NUMBER REBUILD ----------
    const prefix = payeeType === "INTERNAL" ? "I" : "E";
    const payeeNumber = `${prefix}${payeeNumberDigits}`;

    // ---------- CHECK DUPLICATE PAYEE NUMBER ----------
    const duplicate = await Payee.findOne({
      payeeNumber,
      _id: { $ne: req.params.id }
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Payee number already exists"
      });
    }

    // ---------- UPDATE PAYEE ----------
    const oldPayee = await Payee.findById(req.params.id).lean();
    const payee = await Payee.findByIdAndUpdate(
      req.params.id,
      {
        payeeType,
        payeeNumber,
        name,
        designation,
        address,
        telephone,
        appointmentNo,
  appointmentDate,
        departmentCode,
        contractStartDate,
        contractEndDate
      },
      { new: true }
    );

await logAction({
  req,
  action: "UPDATE",
  module: "PAYEE",
  recordId: payee.payeeNumber,
  oldData: oldPayee,
  newData: payee,
  description: "Payee updated"
});
    // ---------- SOFT DELETE OLD ALLOCATIONS ----------
    await PayeeAllocation.updateMany(
      { payeeId: payee._id },
      { isActive: false }
    );

    // ---------- INSERT NEW ALLOCATIONS (NO _id) ----------
    if (Array.isArray(allocations) && allocations.length > 0) {
      const cleanAllocations = allocations.map((a) => ({
        payeeId: payee._id,
        batchCode: a.batchCode,
        subjectCode: a.subjectCode,
        topicCode: a.topicCode,
        ratePerHour: a.ratePerHour,
        allocatedHours: a.allocatedHours
      }));

      await PayeeAllocation.insertMany(cleanAllocations);
    }

    res.json({
      message: "Payee updated successfully",
      payee
    });
  } catch (err) {
    console.error("UPDATE PAYEE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* =====================================================
   SOFT DELETE PAYEE
===================================================== */
export const disablePayee = async (req, res) => {
  // 1️⃣ Fetch payee first (for log)
  const payee = await Payee.findById(req.params.id);

  if (!payee) {
    return res.status(404).json({ message: "Payee not found" });
  }

  // 2️⃣ Soft delete
  await Payee.findByIdAndUpdate(req.params.id, {
    isActive: false
  });

  await PayeeAllocation.updateMany(
    { payeeId: req.params.id },
    { isActive: false }
  );

  // 3️⃣ Log delete
  await logAction({
    req,
    action: "DELETE",
    module: "PAYEE",
    recordId: payee.payeeNumber,
    oldData: payee,
    description: "Payee disabled"
  });

  res.json({ message: "Payee disabled" });
};

