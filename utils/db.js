const mongoose = require("mongoose");

// Database connection state
let isConnected = false;

// Log the MongoDB URI being used (without credentials)
const logSafeUri = () => {
  const uri = process.env.MONGODB_URI || "";
  // Hide username and password if present
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://*****:*****@");
};

const connectDB = async (retries = 5, delay = 5000) => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("Using existing database connection");
    return mongoose.connection;
  }

  try {
    console.log(`Attempting to connect to MongoDB at: ${logSafeUri()}`);

    // Set mongoose options
    mongoose.set("strictQuery", false);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
      connectTimeoutMS: 30000, // Timeout for initial connection
      // These options are deprecated but kept for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully");
    isConnected = true;

    // Add connection error handler
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      isConnected = false;
    });

    // Add disconnection handler
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });

    // Only handle actual SIGINT signals, not from HTTP requests
    process.removeAllListeners("SIGINT");
    process.on("SIGINT", async () => {
      console.log("Received SIGINT. Closing MongoDB connection...");
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed due to app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });

    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    isConnected = false;

    // Implement retry mechanism
    if (retries > 0) {
      console.log(
        `Retrying connection in ${
          delay / 1000
        } seconds... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retries - 1, delay);
    }

    console.log(
      "WARNING: MongoDB connection failed but server will continue running"
    );
    return null;
  }
};

// Function to check if DB is connected
const isDBConnected = () => isConnected && mongoose.connection.readyState === 1;

module.exports = {
  connectDB,
  isDBConnected,
};
