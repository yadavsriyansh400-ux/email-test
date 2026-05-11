import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verificationTokens = {};

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/send-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    
    const token = crypto.randomBytes(32).toString("hex");

    
    verificationTokens[token] = email;

    
    const verificationLink =
      `${process.env.BASE_URL}/verify/${token}`;

    
    await transporter.sendMail({
      from: `"Email Test" <${process.env.EMAIL_USER}>`,
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

  const token = req.params.token;

  const email = verificationTokens[token];

  
  if (!email) {

    return res.send(`
      <div style="
        font-family: Arial;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        flex-direction:column;
      ">

        <h1>❌ Invalid or Expired Token</h1>

      </div>
    `);
  }

  
  delete verificationTokens[token];

  
  res.send(`
    <div style="
      font-family: Arial;
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
      flex-direction:column;
      background:#f4f4f4;
    ">

      <div style="
        background:white;
        padding:40px;
        border-radius:10px;
        box-shadow:0 0 10px rgba(0,0,0,0.1);
        text-align:center;
      ">

        <h1>✅ Email Verified Successfully</h1>

        <p style="margin-top:10px;">
          ${email}
        </p>

        <p style="color:gray;">
          You can now close this tab.
        </p>

      </div>

    </div>
  `);
});

app.use(express.static("public"));

app.listen(process.env.PORT, () => {

  console.log(`
Server running on port ${process.env.PORT}
  `);
});