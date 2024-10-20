import app from "./app.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDatabase from "./config/database.js";
import "express-async-errors";

// Resolve directory paths using ES6 modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, "/config/config.env") });

// Debugging output to check if the DB_URI is loaded correctly
console.log(`DB_URI: ${process.env.DB_URI}`);

// Connect to the database
connectDatabase();

// Start the server
const PORT = process.env.PORT || 5000; // Default to port 5000 if not specified
const server = app.listen(PORT, () => {
  console.log(
    `Server listening on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  console.error("Shutting down the server due to unhandled rejection");
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  console.error("Shutting down the server due to uncaught exception");
  server.close(() => {
    process.exit(1);
  });
});
