const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const {
  findUserByEmail,
  savePasswordResetOTP,
  verifyPasswordResetOTP,
  updateUserPassword,
  deletePasswordResetOTP,
} = require("../models/forgotPassword.model");

// =====================================
// Send OTP
// =====================================
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await deletePasswordResetOTP(user.id);

    await savePasswordResetOTP(
        user.id,
        user.email,
        otp,
        expiresAt
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// =====================================
// Verify OTP
// =====================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    const otpRow = await verifyPasswordResetOTP(user.id, otp);

    if (!otpRow) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// =====================================
// Reset Password
// =====================================
const resetPassword = async (req, res) => {
    try {

        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required"
            });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await updateUserPassword(user.id, hashedPassword);

        await deletePasswordResetOTP(user.id);

        return res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {

        console.log("Reset Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

module.exports = {
  sendOTP,
  verifyOTP,
  resetPassword,
};