const db = require("../../config/db");
const { jwtgen } = require("../../jwt/jwt");

exports.login = async (req, res) => {

    const { email, password } = req.body;

    try {

        const conn = await db;

        const [rows] = await conn.query(
            "SELECT * FROM usermodel WHERE email = ? AND password = ?",
            [email, password]
        );

        if (rows.length === 0) {
            return res.send({ msg: "Email or password does not match" });
        }

        if (rows[0].is_verified === 0) {
            return res.send({
                msg: "Please verify your account",
                verify_issue: true
            });
        } 

        const username = rows[0].username;
        const token = jwtgen(username)
        res.send({
            msg: "Login successful",
            token: token,
            username: username
        });

    } catch (e) {

        console.error(e);
        res.send({ msg: "Server error" });

    }

};