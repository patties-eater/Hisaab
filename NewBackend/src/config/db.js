const { Pool } = require("pg");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;

function createUnavailableDbClient() {
  const error = new Error(
    "DATABASE_URL is not configured. Set it in your deployment environment."
  );

  return {
    async query() {
      throw error;
    },
    async connect() {
      throw error;
    },
    async end() {
      return undefined;
    },
  };
}

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
    })
  : createUnavailableDbClient();

module.exports = pool;
module.exports.hasDatabaseUrl = Boolean(databaseUrl);
