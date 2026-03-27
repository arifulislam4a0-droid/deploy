const db = require("../../config/db");
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {

    const { name, username, email, password } = req.body;


    const checkUsername = `
    SELECT * FROM usermodel 
    WHERE username = ?
    `;

    const checkUserEmail = `
    SELECT * FROM usermodel 
    WHERE email = ?
    `;

    try {

        const conn = await db;

        const [userResult] = await conn.query(checkUsername, [username]);

        if (userResult.length > 0) {
            return res.send({ msg: "Username already exists" });
        }

        const [emailResult] = await conn.query(checkUserEmail, [email]);

        if (emailResult.length > 0) {
            return res.send({ msg: "Email already exists" });
        }

        let base = Math.floor(100000 + Math.random() * 900000).toString();
        let seconds = new Date().getSeconds().toString();
        let otp = (base + seconds).slice(0, 6);

        const insertUser = `
        INSERT INTO usermodel (name, username, email, password, otp, otp_created_at )
        VALUES (?, ?, ?, ?, ?, NOW())
        `;

        await conn.query(insertUser, [name, username, email, password, otp]);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Zerocode" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Zerocode - OTP Verification",
            text: `Dear ${name},
        
Your One-Time Password (OTP) is: ${otp}
        
This OTP will expire in 10 minutes.
        
Zerocode Team`
        };

        await transporter.sendMail(mailOptions);

        res.send({ msg: "Signup succesfully" });

    } catch (e) {

        console.error(e);
        res.send({ msg: "Server error" });

    }

};