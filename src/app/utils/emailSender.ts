import nodemailer from 'nodemailer';
import { envVars } from '../../config/env';

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_HOST,
  port: envVars.EMAIL_PORT,
  secure: envVars.EMAIL_PORT === 465, 
  auth: {
    user: envVars.EMAIL_USER,
    pass: envVars.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${envVars.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Verify Your Email</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 0;">
            <!-- Card -->
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="background:#4f46e5; padding:20px; text-align:center;">
                  <h1 style="color:#ffffff; margin:0; font-size:24px;">
                    Skill Bridge
                  </h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:30px; color:#333333;">
                  <h2 style="margin-top:0;">Verify your email address</h2>
                  <p style="font-size:16px; line-height:1.5;">
                    Thanks for signing up! Please confirm your email address by clicking the button below.
                  </p>
                  <div style="text-align:center; margin:30px 0;">
                    <a href="${verificationUrl}"
                       style="background:#4f46e5; color:#ffffff; padding:14px 28px;
                              text-decoration:none; border-radius:6px; font-size:16px;
                              display:inline-block;">
                      Verify Email
                    </a>
                  </div>
                  <p style="font-size:14px; color:#666;">
                    If the button doesn’t work, copy and paste this link into your browser:
                  </p>
                  <p style="font-size:14px; word-break:break-all; color:#4f46e5;">
                    ${verificationUrl}
                  </p>
                  <p style="font-size:14px; color:#666; margin-top:30px;">
                    If you didn’t create an account, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f4f6f8; padding:15px; text-align:center; font-size:12px; color:#888;">
                  © 2026 Skill Bridge. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: envVars.EMAIL_FROM,
    to: email,
    subject: "Verify your email address",
    html: html,
  });
};
