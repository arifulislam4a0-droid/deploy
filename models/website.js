const db = require("../config/db");


const table = `
CREATE TABLE IF NOT EXISTS website_model(
    username VARCHAR(50),
    code_text MEDIUMTEXT,
    running BOOLEAN DEFAULT TRUE,
    method VARCHAR(50),
    link VARCHAR(255) UNIQUE,
    image VARCHAR(255)
);
`; 


async function createTable_web() {
    try {
        const conn = await db;
        await conn.query(table);
    } catch (err) {
        console.error("Table create error:", err);
    }
}

module.exports = createTable_web; 