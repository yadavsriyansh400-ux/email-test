import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const transporter = nodemailer.createTransport({

    host: "smtp-relay.brevo.com",

    port: 587,

    secure: false,

    auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_SMTP_KEY,
    },

});


app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});


app.post("/send-verification", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                message: "Email is required",
            });

        }

        const token = crypto
            .randomBytes(32)
            .toString("hex");

        const verificationLink =
            `${process.env.BASE_URL}/verify/${token}`;

        await transporter.sendMail({

            from: `"Email Test" <${process.env.SENDER_EMAIL}>`,

            to: email,

            subject: "Verify Your Email",

            html: `
        <div style="
          font-family: Arial;
          padding: 20px;
        ">

          <h2>Email Verification</h2>

          <p>
            Click the button below to verify your email.
          </p>

          <a
            href="${verificationLink}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:black;
              color:white;
              text-decoration:none;
              border-radius:5px;
              margin-top:10px;
            "
          >
            Verify Email
          </a>

        </div>
      `,
        });

        console.log("Email sent to:", email);

        res.status(200).json({
            message: "Verification email sent successfully",
        });

    } catch (error) {

        console.log("Email Error:", error);

        res.status(500).json({
            message: "Failed to send email",
        });

    }

});

app.get("/verify/:token", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "success.html")
    );

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});