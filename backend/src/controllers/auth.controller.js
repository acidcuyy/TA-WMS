import { readDB } from "../services/data.service.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const db = await readDB();
  const users = db ? db.users : [];

  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.pass === password.trim()
  );

  if (!user) {
    return res.status(401).json({ message: "Email atau password salah." });
  }

  // Return user info (excluding password for safety)
  const { pass, ...userWithoutPass } = user;
  res.status(200).json({
    message: "Login successful",
    user: userWithoutPass,
  });
};
