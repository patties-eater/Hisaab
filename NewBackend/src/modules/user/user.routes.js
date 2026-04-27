const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../config/db");
const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

function getAdminCredentials() {
  return {
    userId: process.env.ADMIN_USER_ID,
    password: process.env.ADMIN_PASSWORD,
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
  };
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const newUser = await pool.query(
      "INSERT INTO users (id, email, password, created_at) VALUES (gen_random_uuid(), $1, $2, NOW()) RETURNING *",
      [email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error("🔥 Error in register:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = signToken({ id: user.id, role: "user", email: user.email });

    res.json({
      message: "Login successful",
      token,
      preferredLanguage: user.preferred_language || "en",
      preferredAccountMode: user.preferred_account_mode || "personal",
    });
  } catch (err) {
    console.error("🔥 Error in login:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const { userId, password } = req.body;
    const admin = getAdminCredentials();

    if (!admin.userId || (!admin.password && !admin.passwordHash)) {
      return res.status(500).json({
        error:
          "Admin login is not configured. Set ADMIN_USER_ID and ADMIN_PASSWORD or ADMIN_PASSWORD_HASH.",
      });
    }

    if (userId !== admin.userId) {
      return res.status(400).json({ error: "Invalid admin credentials" });
    }

    let isMatch = false;

    if (admin.passwordHash) {
      isMatch = await bcrypt.compare(password, admin.passwordHash);
    } else {
      isMatch = password === admin.password;
    }

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid admin credentials" });
    }

    const token = signToken({ id: admin.userId, role: "admin", userId: admin.userId });

    res.json({
      message: "Admin login successful",
      token,
      role: "admin",
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/preferences", authMiddleware, async (req, res) => {
  try {
    const { language, accountMode } = req.body;

    if (language && !["en", "ne"].includes(language)) {
      return res.status(400).json({ error: "Invalid language preference" });
    }

    if (accountMode && !["personal", "shop"].includes(accountMode)) {
      return res.status(400).json({ error: "Invalid account mode preference" });
    }

    const result = await pool.query(
      `
        UPDATE users
        SET preferred_language = COALESCE($1, preferred_language),
            preferred_account_mode = COALESCE($2, preferred_account_mode)
        WHERE id = $3
        RETURNING id, email, preferred_language, preferred_account_mode
      `,
      [language || null, accountMode || null, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        preferredLanguage: result.rows[0].preferred_language || "en",
        preferredAccountMode: result.rows[0].preferred_account_mode || "personal",
      },
    });
  } catch (err) {
    console.error("Preference update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    let preferredLanguage = "en";
    let preferredAccountMode = "personal";

    if ((verified.role || "user") === "user" && verified.id) {
      const userResult = await pool.query(
        "SELECT preferred_language, preferred_account_mode FROM users WHERE id = $1",
        [verified.id],
      );
      preferredLanguage = userResult.rows[0]?.preferred_language || "en";
      preferredAccountMode = userResult.rows[0]?.preferred_account_mode || "personal";
    }

    res.json({
      success: true,
      data: {
        id: verified.id,
        role: verified.role || "user",
        email: verified.email || null,
        userId: verified.userId || null,
        preferredLanguage,
        preferredAccountMode,
      },
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
});

module.exports = router;
