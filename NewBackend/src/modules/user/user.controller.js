const { loginUser } = require("./user.service");

async function loginController(req, res) {
  const { userId, password } = req.body;

  try {
    const data = await loginUser(userId, password);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
}

module.exports = { loginController };