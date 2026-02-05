import TravellingClaim from "../models/travellingClaim.model.js";
import Payee from "../models/Payee.js";
import { logAction } from "../utils/auditLogger.js";
import { MANAGEMENT_MODULES } from "../constants/managementModules.js";

export const createTravellingClaim = async (req, res) => {
  try {
    const {
      date,
      payeeId,
      dateOfTravelling,
      appliedDateForTravellingClaim,
      transportAllowance,
      combinedAllowance,
      additionalAllowance,
      lateFines,
      total
    } = req.body;

    if (!date || !payeeId || !total) {
      return res.status(400).json({
        message: "Date, Employee and Total are required"
      });
    }

    const payee = await Payee.findById(payeeId).lean();
    if (!payee) {
      return res.status(400).json({ message: "Invalid employee selected" });
    }

    const record = await TravellingClaim.create({
      date,
      payeeId,

      empNo: payee.payeeNumber,
      employeeName: payee.name,

      dateOfTravelling,
      appliedDateForTravellingClaim,
      transportAllowance,
      combinedAllowance,
      additionalAllowance,
      lateFines,
      total
    });

    await logAction({
      req,
      action: "CREATE",
      module: MANAGEMENT_MODULES.TRAVELLING_CLAIM,
      description: "Created new travelling claim record",
      recordId: record._id,
      newData: record
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("CREATE TRAVELLING CLAIM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTravellingClaims = async (req, res) => {
  const records = await TravellingClaim.find({ isDeleted: false })
    .populate("payeeId", "payeeNumber name")
    .sort({ createdAt: -1 });

  res.json(records);
};

export const updateTravellingClaim = async (req, res) => {
  const oldData = await TravellingClaim.findById(req.params.id).lean();
  if (!oldData) return res.status(404).json({ message: "Record not found" });

  const updated = await TravellingClaim.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: MANAGEMENT_MODULES.TRAVELLING_CLAIM,
    description: "Updated travelling claim record",
    recordId: updated._id,
    oldData,
    newData: updated
  });

  res.json(updated);
};

export const deleteTravellingClaim = async (req, res) => {
  await TravellingClaim.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: MANAGEMENT_MODULES.TRAVELLING_CLAIM,
    description: "Soft deleted travelling claim record",
    recordId: req.params.id
  });

  res.json({ message: "Record deleted" });
};
