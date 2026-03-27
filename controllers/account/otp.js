const nodemailer = require("nodemailer");
const db = require("../../config/db");

exports.sendOTP = async (req, res) => {

    const { email } = req.body;

    try {

        const conn = await db;

      
        const [rows] = await conn.query(
            "select name from usermodel where email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.send({
                msg: "User not found"
            });
        }

        const name = rows[0].name;

        let base = Math.floor(100000 + Math.random() * 900000).toString();
        let seconds = new Date().getSeconds().toString();
        let otp = (base + seconds).slice(0, 6);

        // save otp
        await conn.query(
            "UPDATE usermodel SET otp = ?, otp_created_at = NOW() WHERE email = ?",
            [otp, email]
        );

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

        res.send({
            msg: "OTP sent successfully.plz check your email"
        });

    } catch (err) {

        console.error(err);
        res.send({
            msg: "Server error"
        });

    }
};



exports.verifyOtp = async (req, res) => {

    const { email, otp } = req.body;

    try {

        const conn = await db;

        const [rows] = await conn.query(
            "SELECT * FROM usermodel WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.send({ msg: "User not found" });
        }

        const user = rows[0];

        if (user.otp !== otp) {
            return res.send({ msg: "Invalid OTP" });
        }

        const otpTime = new Date(user.otp_created_at).getTime();
        const now = Date.now();

        if (now - otpTime > 10 * 60 * 1000) {
            return res.send({ msg: "OTP expired" });
        }

        await conn.query(
            "UPDATE usermodel SET is_verified = 1, otp = NULL, otp_created_at = NULL WHERE email = ?",
            [email]
        );

        res.send({
            msg: "Email verified successfully!"
        });

    } catch (error) {

        console.error(error);
        res.send({ msg: "Server error" });

    }
}; 

