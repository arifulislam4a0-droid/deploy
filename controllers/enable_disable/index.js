const db = require("../../config/db");
const { jwtVerify } = require("../../jwt/jwt");

exports.enable_disable = async (req, res) => {
    const { link, username, token } = req.body;
    const { running } = req.body; // optional

    try {



        if (!jwtVerify(token)) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const conn = await db;
        // 🔍 1. current status আনো
        const [rows] = await conn.query(
            "SELECT running FROM website_model WHERE link = ? AND username = ?",
            [link, username]
        );

        if (rows.length === 0) {
            return res.status(404).send("Website not found");
        }

        const currentStatus = rows[0].running;

        let newStatus = currentStatus; // default same থাকবে

        // 🧠 2. only update if frontend sends valid value
        if (running === 0 || running === 1) {
            newStatus = running;

            await conn.query(
                "UPDATE website_model SET running = ? WHERE link = ? AND username = ?",
                [newStatus, link, username]
            );
        }

        // ✅ 3. always return current state
        return res.send({
            running: newStatus
        });

    } catch (e) {
        console.error(e);
        res.status(500).send("Server error");
    }
};