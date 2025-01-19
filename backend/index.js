const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createServer } = require("http");
require("dotenv").config();

const EmployeeRoutes = require("./Routes/EmployeeRoutes");
const { initializeChatServer } = require("./chatServer.js");
const notificationRouter = require("./notificationServer"); // Import the notification server routes

const app = express();
const server = createServer(app); // Create an HTTP server
const PORT = process.env.PORT || 8080;

// MongoDB connection (ensure this is handled in db.js and only called once)
require("./Models/db"); // Ensures MongoDB connects before starting the server

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" })); // Add a more specific CORS configuration if needed
app.use(bodyParser.json());

// API Routes
app.use("/api/employees", EmployeeRoutes);

// Notification Routes
app.use("/api/notifications", notificationRouter); // Mount the notification routes

const cattleRoutes = require('./Routes/cattleRoutes');

app.use('/api/cattle', cattleRoutes);
// Initialize the chat server
initializeChatServer(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

// Add error handling
server.on("error", (error) => {
  console.error("Error in server:", error);
});
