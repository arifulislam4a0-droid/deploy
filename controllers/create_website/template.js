const db = require("../../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { jwtVerify } = require("../../jwt/jwt");

// ================= AUTO CREATE UPLOADS FOLDER =================
const uploadDir = path.join(__dirname, "../../uploads");

const ensureUploadDir = () => {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
};

ensureUploadDir();

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureUploadDir();
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
        if (allowed.test(path.extname(file.originalname))) {
            cb(null, true);
        } else {
            cb(new Error("Only images allowed (jpg, jpeg, png, webp, gif)"));
        }
    }
});

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

// ================= LINK GENERATOR =================
function generateLink(length = 4) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ================= UNIQUE LINK CHECK =================
async function createUniqueLink(conn) {
    let link;
    let exists = true;

    while (exists) {
        link = generateLink(4);

        const [rows] = await conn.query(
            "SELECT link FROM website_model WHERE link = ?",
            [link]
        );

        if (rows.length === 0) {
            exists = false;
        }
    }

    return link;
}

// ================= MAIN CONTROLLER =================
exports.template_web_create = [
    upload.single("image"),

    async (req, res) => {
        const { username, code_text, link,token } = req.body;

        try {

            if (!jwtVerify(token)) {
                return res.status(401).json({ message: "Unauthorized"});
            }



            const conn = await db;
            // 🔥 USERNAME CHECK
            const [userResult] = await conn.query(
                "SELECT * FROM usermodel WHERE username = ?",
                [username]
            );

            if (userResult.length === 0) {
                return res.status(400).send({ msg: "Username Not Found" });
            }

            // ================= CHECK EXISTING WEBSITE =================
            let existing = null;

            if (link) {
                const [rows] = await conn.query(
                    "SELECT * FROM website_model WHERE username = ? AND link = ?",
                    [username, link]
                );

                if (rows.length > 0) {
                    existing = rows[0];
                } else {
                    return res.status(404).send({ msg: "Link not found for this user" });
                }
            }

            // ================= IMAGE HANDLING =================
            let imagePath = null;

            if (existing) {
                // Keep old image path if no new image
                imagePath = existing.image;
            }

            if (req.file) {
                // Delete old image if updating and old image exists
                if (existing && existing.image) {
                    deleteImageFile(existing.image);
                }

                // Set new image path
                imagePath = "uploads/" + req.file.filename;
            }

            // ================= UPDATE EXISTING =================
            if (existing) {
                await conn.query(
                    `UPDATE website_model 
                     SET code_text = ?, image = ? 
                     WHERE username = ? AND link = ?`,
                    [code_text, imagePath, username, link]
                );


                return res.status(200).send({
                    msg: "Updated successfully",
                    link,
                    image: imagePath
                });
            }

            // ================= CREATE NEW =================
            const newLink = await createUniqueLink(conn);
            const method = "template";

            await conn.query(
                `INSERT INTO website_model (username, code_text, method, link, image)
                 VALUES (?, ?, ?, ?, ?)`,
                [username, code_text, method, newLink, imagePath]
            );


            res.status(201).send({
                msg: "Created successfully",
                link: newLink,
                image: imagePath
            });

        } catch (e) {
            console.error("❌ Controller Error:", e);

            if (e.code === "LIMIT_FILE_SIZE") {
                return res.status(413).send({ msg: "Image too large (max 10MB)" });
            }

            if (e.message.includes("Only images allowed")) {
                return res.status(415).send({ msg: e.message });
            }

            res.status(500).send({ msg: e.message || "Server error" });
        }
    }
];

// ================= VIEW WEBSITE =================
exports.viewWebsite = async (req, res) => {
    const { link } = req.params;

    try {
        const conn = await db;

        const [rows] = await conn.query(
            "SELECT code_text, running FROM website_model WHERE link = ?",
            [link]
        );

        if (rows.length === 0) {
            return res.status(404).send("Website not found");
        }


        const html = rows[0].code_text;

        const is_running = rows[0].running;

        // 🔴 running check
        if (!is_running) {
            return res.send(`
        <h1 style="text-align:center;margin-top:50px;">
            🚫 Website is currently turned off
        </h1>
    `);
        }


        res.send(html);

    } catch (e) {
        console.error(e);
        res.status(500).send("Server error");
    }
};