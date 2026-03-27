const db = require("../config/db");

const table = `
CREATE TABLE IF NOT EXISTS usermodel (
  username VARCHAR(50) UNIQUE PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  otp VARCHAR(10) DEFAULT NULL,
  otp_created_at DATETIME DEFAULT NULL,
  total_website INT DEFAULT 0
);
`;

async function createTable_user() {
    try {
        const conn = await db;
        await conn.query(table);
    } catch (err) {
        console.error("Table create error:", err);
    }
}

module.exports = createTable_user;