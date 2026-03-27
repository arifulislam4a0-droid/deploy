const mysql = require("mysql2/promise");

const db = mysql.createPool({
    uri: "mysql://root:rKeBjOddpIFnrthijxWctqRasZIsgKNL@gondola.proxy.rlwy.net:31171/railway",
    waitForConnections: true,
    connectionLimit: 10
});

db.getConnection()
    .then(() => console.log("Database connected"))
    .catch(err => console.log(err));

module.exports = db;