const db = require("../../config/db");
const { jwtVerify } = require("../../jwt/jwt");

exports.get_website_list = async (req, res) => {

    const { username, token } = req.body;

    try {
        if (!jwtVerify(token)) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const conn = await db;

        const [rows] = await conn.query(
            "SELECT * FROM website_model WHERE username = ?",
            [username]
        );

        const links = rows.map(row => row.link);

        res.send({
            success: true,
            links
        });

    } catch (e) {
        console.error(e);
        res.status(500).send({ msg: "Server error" });
    }

};