import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Send OTP email to user
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<boolean>} - Success status
 */
export async function sendOTPEmail(email, otp) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Mega Jewels <noreply@megajewels.com>',
            to: email,
            subject: 'Your Login OTP - Mega Jewels',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #c5a059 0%, #8f4a12 100%); color: white; padding: 30px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                        .otp-box { background: white; border: 2px dashed #c5a059; padding: 20px; text-align: center; margin: 20px 0; }
                        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #c5a059; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0; font-family: serif;">AURUM</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Boutique Jewelry Experience</p>
                        </div>
                        <div class="content">
                            <h2 style="color: #1a1a1a; margin-top: 0;">Your Login Code</h2>
                            <p>Hello,</p>
                            <p>You requested to log in to your Mega Jewels account. Please use the following One-Time Password (OTP) to complete your login:</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                            </div>
                            
                            <p><strong>This code will expire in 10 minutes.</strong></p>
                            <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
                            
                            <p style="margin-top: 30px;">Best regards,<br><strong>The Mega Jewels Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} Mega Jewels. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Your Mega Jewels Login OTP is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] OTP sent successfully to ${email}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email] Failed to send OTP to ${email}:`, error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}
