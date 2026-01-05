import nodemailer from 'nodemailer';

// Configure the SMTP transporter
// Users should provide MESSAGE_EMAIL and MESSAGE_PASSWORD in their .env file
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to another service if needed
  auth: {
    user: process.env.MESSAGE_EMAIL,
    pass: process.env.MESSAGE_PASSWORD,
  },
});

export const sendOTPEmail = async (to: string, otp: string) => {
  if (!process.env.MESSAGE_EMAIL || !process.env.MESSAGE_PASSWORD) {
    console.warn('⚠️ SMTP credentials missing in .env. OTP email will NOT be sent.');
    console.log(`[Mock Email Service] OTP for ${to}: ${otp}`);
    return;
  }

  const mailOptions = {
    from: `"Campus Bazaar" <${process.env.MESSAGE_EMAIL}>`,
    to,
    subject: 'Your Verification Code - Campus Bazaar',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Campus Bazaar</h2>
        <p style="color: #333; font-size: 16px;">Hello,</p>
        <p style="color: #555; line-height: 1.5;">
          Thank you for signing up! Please use the following One-Time Password (OTP) to verify your email address.
        </p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b;">${otp}</span>
        </div>
        <p style="color: #555; margin-top: 20px;">
          This code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} Campus Bazaar. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email sent to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    // Fallback to console log just in case so user isn't stuck during dev
    console.log(`[Backup OTP Log] OTP for ${to}: ${otp}`); 
    throw new Error('Failed to send verification email');
  }
};
