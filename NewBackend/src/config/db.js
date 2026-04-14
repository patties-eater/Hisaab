const { Pool } = require("pg");
const dns = require("dns");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;

try {
  dns.setDefaultResultOrder("ipv4first");
} catch (err) {
  // Older runtimes may not support changing DNS result order.
}

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
      family: 4,
      ...(databaseUrl.includes("supabase.co")
        ? {
            ssl: {
              rejectUnauthorized: false,
            },
          }
        : {}),
    })
  : createUnavailableDbClient();

module.exports = pool;
module.exports.hasDatabaseUrl = Boolean(databaseUrl);
