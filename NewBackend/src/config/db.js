const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log("DB connected [OK]"))
  .catch(err => console.error("DB connection error [FAIL]", err));

module.exports = pool;
