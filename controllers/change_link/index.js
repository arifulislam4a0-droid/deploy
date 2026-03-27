const db = require("../../config/db");
const { jwtVerify } = require("../../jwt/jwt");


exports.changeLink = async (req, res) => {
    const { username, token, link, newlink } = req.body;

    try {
        if (!jwtVerify(token)) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const conn = await db;

        // 🔍 1. check current website exists কিনা
        const [current] = await conn.query(
            "SELECT * FROM website_model WHERE username = ? AND link = ?",
            [username, link]
        );

        if (current.length === 0) {
            return res.status(404).send({ msg: "Current link not found" });
        }

        // 🔍 2. check newlink already exists কিনা
        const [exist] = await conn.query(
            "SELECT link FROM website_model WHERE link = ?",
            [newlink]
        );

        if (exist.length > 0) {
            return res.status(400).send({ msg: "Link already exists" });
        }

        // 🔄 3. update link
        await conn.query(
            "UPDATE website_model SET link = ? WHERE username = ? AND link = ?",
            [newlink, username, link]
        );

        // ✅ 4. success response
        return res.send({
            msg: "Link updated successfully ✅",
            old_link: link,
            new_link: newlink
        });

    } catch (e) {
        console.error(e);
        res.status(500).send({ msg: "Server error" });
    }
};