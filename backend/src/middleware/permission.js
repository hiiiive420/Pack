export const allowPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === "ADMIN") return next();

    if (
      req.user.role === "CLERK" &&
      req.user.permissions?.includes(permission)
    ) {
      return next();
    }

    return res.status(403).json({
      message: "Access denied"
    });
  };
};
