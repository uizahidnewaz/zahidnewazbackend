require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const detailRoutes = require("./routes/detailRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route to verify server is running
app.get("/test", (req, res) => {
  res.json({ message: "Server is running correctly" });
});

// MongoDB connection with improved error handling
console.log("Attempting to connect to MongoDB...");
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log("Server will continue running without database connection");
  });

// Error handling middleware (must be defined before routes)
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

// Mount routes
app.use("/", detailRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
