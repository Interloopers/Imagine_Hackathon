const express = require("express");
const router = express.Router();

// Example: Mock user data (replace this with your actual database or authentication method)
const users = [
  { email: "test@example.com", tel: "+1234567890" }, // Mockup user data
];

// POST request to handle login
router.post("/login", (req, res) => {
  const { email, tel } = req.body;

  // Find the user that matches the email and phone number
  const user = users.find(
    (user) => user.email === email && user.tel === tel
  );

  // If the user doesn't exist or the credentials don't match
  if (!user) {
    return res.status(401).send({ error: "Invalid credentials" });
  }

  // If the user exists, send a success response (you can add JWT token or session here)
  return res.status(200).send({
    message: "Login successful",
    user,
    // For real-world applications, generate a token here
    // token: "your-jwt-token-here",
  });
});

module.exports = router;
