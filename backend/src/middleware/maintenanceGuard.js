export const maintenanceGuard = (req, res, next) => {
  if (
    req.user.role === "ADMIN" ||
    req.user.permissions?.includes("MAINTENANCE_MANAGEMENT")
  ) {
    return next();
  }

  return res.status(403).json({ message: "Access denied" });
};
