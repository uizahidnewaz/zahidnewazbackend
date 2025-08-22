require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { connectDB, isDBConnected } = require("./utils/db");
const projectRoutes = require("./routes/projectRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware
app.use((req, res, next) => {
  // Skip the db check for the test route
  if (req.path === "/test") {
    return next();
  }

  if (!isDBConnected()) {
    return res.status(503).json({
      error: "Database Unavailable",
      message:
        "The database connection is not established. Please try again later.",
    });
  }
  next();
});

// Test route to verify server is running
app.get("/test", (req, res) => {
  res.json({
    message: "Server is running correctly",
    dbStatus: isDBConnected() ? "connected" : "disconnected",
  });
});

// Error handling middleware (must be defined before routes)
app.use((err, req, res, next) => {
  console.error("Error:", err);
  console.error("Error Stack:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Mount routes
app.use("/api/", projectRoutes);

// Start server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Initialize the application
(async () => {
  try {
    // First try to connect to MongoDB with 5 retries, 5 seconds between retries
    await connectDB(5, 5000);
    // Then start the server
    startServer();
  } catch (error) {
    console.error("Application initialization error:", error);
    // Start server even if there's an error during startup
    startServer();
  }
})();

module.exports = app;
