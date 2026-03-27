const db = require("../../config/db");
const path = require("path");
const fs = require("fs");
const { jwtVerify } = require("../../jwt/jwt");

// ================= DELETE IMAGE HELPER =================
const deleteImageFile = (imagePath) => {
    if (!imagePath) return;

    try {
        const fullPath = path.join(__dirname, "../../" + imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (err) {
        console.error("⚠️ Error deleting image:", err.message);
    }
};

// ================= DELETE WEBSITE CONTROLLER =================
exports.deleteWebsite = async (req, res) => {
    const { username, token, link } = req.body;

    try {
        if (!jwtVerify(token)) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const conn = await db;

        // 🔥 USERNAME VALIDATION
        const [userResult] = await conn.query(
            "SELECT * FROM usermodel WHERE username = ?",
            [username]
        );

        if (userResult.length === 0) {
            return res.status(400).send({ msg: "Username Not Found" });
        }

        // 🔥 CHECK IF WEBSITE EXISTS
        const [websiteResult] = await conn.query(
            "SELECT * FROM website_model WHERE username = ? AND link = ?",
            [username, link]
        );

        if (websiteResult.length === 0) {
            return res.status(404).send({ msg: "Website not found" });
        }

        const website = websiteResult[0];

        // 🔥 DELETE IMAGE FILE FROM SERVER
        if (website.image) {
            deleteImageFile(website.image);
        }

        // 🔥 DELETE FROM DATABASE
        await conn.query(
            "DELETE FROM website_model WHERE username = ? AND link = ?",
            [username, link]
        );


        res.status(200).send({
            msg: "Website deleted successfully",
            deletedLink: link
        });

    } catch (e) {
        console.error("❌ Delete Error:", e);
        res.status(500).send({ msg: e.message || "Server error" });
    }
};