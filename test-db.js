require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB, isDBConnected } = require("./utils/db");

const testConnection = async () => {
  try {
    console.log("Checking environment...");
    console.log("Node Environment:", process.env.NODE_ENV || "not set");
    console.log(
      "MongoDB URI:",
      process.env.MONGODB_URI ? "Set (hidden for security)" : "Not set"
    );

    if (!process.env.MONGODB_URI) {
      console.error(
        "ERROR: MONGODB_URI is not defined in environment variables"
      );
      process.exit(1);
    }

    console.log("\nAttempting database connection...");
    await connectDB(3, 3000); // 3 retries, 3 seconds between retries

    // Check connection state
    console.log("\nConnection state information:");
    console.log(
      "Connection state (0-disconnected, 1-connected, 2-connecting, 3-disconnecting):",
      mongoose.connection.readyState
    );
    console.log("isDBConnected() returns:", isDBConnected());

    if (mongoose.connection.readyState === 1) {
      console.log("\nSuccessfully connected to MongoDB!");

      // Test simple query
      console.log("\nTesting a simple query...");
      try {
        const Project = require("./models/projects");
        const count = await Project.countDocuments().maxTimeMS(5000);
        console.log(`Database contains ${count} projects`);
      } catch (queryError) {
        console.error("Error querying database:", queryError);
      }
    } else {
      console.error("\nFailed to connect to MongoDB properly");
    }

    // Close connection
    console.log("\nClosing connection...");
    await mongoose.connection.close();
    console.log("Connection closed successfully");
  } catch (error) {
    console.error("An error occurred during testing:", error);
  } finally {
    process.exit(0);
  }
};

// Run the test
testConnection();
