import SuppliesRegister from "../models/SuppliesRegister.js";
import { logAction } from "../utils/auditLogger.js";

/* =====================================================
   CREATE SUPPLY ENTRY
===================================================== */
export const createSupply = async (req, res) => {
  try {
    if (
      req.user.role !== "ADMIN" &&
      !req.user.permissions.includes("SUPPLIES_REGISTER")
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      date,
      itemType,
      natureCode,
      natureDescription,
      supplierName,
      items,
      amount
    } = req.body;

    if (
      !date ||
      !itemType ||
      !natureCode ||
      !natureDescription ||
      !supplierName ||
      !items ||
      amount === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const supply = await SuppliesRegister.create({
      date,
      itemType,
      natureCode,
      natureDescription,
      supplierName,
      items,
      amount
    });

    await logAction({
      req,
      action: "CREATE",
      module: "SUPPLIES_REGISTER",
      recordId: supply._id.toString(),
      newData: supply,
      description: "Supply entry created"
    });

    res.status(201).json({
      message: "Supply entry created",
      supply
    });
  } catch (err) {
    console.error("CREATE SUPPLY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET SUPPLIES
===================================================== */
export const getSupplies = async (req, res) => {
  const supplies = await SuppliesRegister.find({ isActive: true })
    .sort({ date: -1 });

  res.json(supplies);
};

/* =====================================================
   UPDATE SUPPLY
===================================================== */
export const updateSupply = async (req, res) => {
  try {
    const oldSupply = await SuppliesRegister.findById(req.params.id).lean();

    const supply = await SuppliesRegister.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    await logAction({
      req,
      action: "UPDATE",
      module: "SUPPLIES_REGISTER",
      recordId: supply._id.toString(),
      oldData: oldSupply,
      newData: supply,
      description: "Supply entry updated"
    });

    res.json(supply);
  } catch (err) {
    console.error("UPDATE SUPPLY ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* =====================================================
   DELETE (SOFT)
===================================================== */
export const deleteSupply = async (req, res) => {
  const supply = await SuppliesRegister.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: "SUPPLIES_REGISTER",
    recordId: supply._id.toString(),
    description: "Supply entry deleted"
  });

  res.json({ message: "Supply entry deleted" });
};
