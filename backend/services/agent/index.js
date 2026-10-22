
import express from "express";
import dotenv from "dotenv";

import connectDb from "./config/db.js";
import router from "./routes/agent.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 7000;

app.use(express.json());

app.use("/api/agent", router);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello from agent service",
  });
});

// Handle unknown routes
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = "ROUTE_NOT_FOUND";
  next(error);
});

// Centralized error handler — must be registered last
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDb();

    app.listen(port, () => {
      console.log(`Agent service started on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start agent service:", error);
    process.exit(1);
  }
};

startServer();
