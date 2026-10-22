
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Something went wrong";

  console.error("🚨 Error:", {
    message: err.message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    code: err.code || "INTERNAL_SERVER_ERROR",
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
};
