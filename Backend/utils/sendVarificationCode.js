import { generateVarificationEmailTemplaate } from "./emailTemplate.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVarificationCode(verificationCode, email, res) {
  try {
    const message = generateVarificationEmailTemplaate(verificationCode);
    sendEmail({
      email: email,
      subject: "Verification Code for Liabrary Mangement System",
      message,
    });
    res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in sending verification code",
    });
  }
}
