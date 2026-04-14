const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByUserId } = require("./user.repository");

async function loginUser(userId, password) {
  const user = await findUserByUserId(userId);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.user_id, id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { token, user:
    {
      id: user.id, 
      userId: user.user_id, 
      name: user.name
    }
  };
}

module.exports = { loginUser };

