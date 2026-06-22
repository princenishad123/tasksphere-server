const errorHandler = (err, req, res, next) => {
  console.error("Error:", err); // Log for debugging

  // Default status code (500 if not set)
  const statusCode = err.statusCode || 500;

  // Response JSON format
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;