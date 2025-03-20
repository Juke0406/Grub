interface EmailTemplateProps {
  username: string;
  uri: string;
}

export const VerificationEmail = ({
  username,
  uri,
}: Readonly<EmailTemplateProps>) => {
  const emailHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email Address</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff;">
                <tr>
                    <td>
                        <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <div style="background-color: #ffffff; padding: 40px 30px 20px 30px; text-align: center;">
                                <h1 style="margin-top: 0; margin-bottom: 10px; font-size: 24px; color: #333333;">Verify Your Email Address</h1>
                                <p style="margin-top: 0; margin-bottom: 20px; color: #777777; font-size: 16px; line-height: 1.4;">
                                    Welcome ${username}! Please verify your email address by clicking the button below.
                                </p>
                            </div>
                            <div style="padding: 30px 30px 20px 30px; text-align: center;">
                                <a href="${uri}" style="display: inline-block; padding: 14px 28px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px;">
                                    Verify Email
                                </a>
                            </div>
                            <div style="padding: 20px 30px 30px 30px; text-align: center;">
                                <p style="margin-top: 0; margin-bottom: 20px; color: #777777; font-size: 14px; line-height: 1.4;">
                                    By verifying your email, you'll gain full access to our platform and its features.
                                </p>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
  return emailHTML;
};

export const VerificationChangeEmail = ({
  username,
  uri,
}: Readonly<EmailTemplateProps>) => {
  const emailHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Change Email Address</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff;">
                <tr>
                    <td>
                        <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <div style="background-color: #ffffff; padding: 40px 30px 20px 30px; text-align: center;">
                                <h1 style="margin-top: 0; margin-bottom: 10px; font-size: 24px; color: #333333;">Hi ${username}!</h1>
                                <p style="margin-top: 0; margin-bottom: 20px; color: #777777; font-size: 16px; line-height: 1.4;">
                                    You recently requested to change your email address. Click the button below to proceed.
                                </p>
                            </div>
                            <div style="padding: 30px 30px 20px 30px; text-align: center;">
                                <a href="${uri}" style="display: inline-block; padding: 14px 28px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px;">
                                    Yes, Change My Email
                                </a>
                            </div>
                            <div style="padding: 20px 30px 30px 30px; text-align: center;">
                                <p style="margin-top: 0; margin-bottom: 20px; color: #777777; font-size: 14px; line-height: 1.4;">
                                    If you didn't request to change email, you can ignore this email. Your email will remain unchanged.
                                </p>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
  return emailHTML;
};

export const ForgetPasswordEmail = ({
  username,
  uri,
}: Readonly<EmailTemplateProps>) => {
  const emailHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff;">
                <tr>
                    <td>
                        <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <div style="background-color: #ffffff; padding: 40px 30px 20px 30px; text-align: center;">
                                <h1 style="margin-top: 0; margin-bottom: 10px; font-size: 24px; color: #333333;">Hi ${username}!</h1>
                                <p style="margin-top: 0; margin-bottom: 20px; color: #777777; font-size: 16px; line-height: 1.4;">
                                    You recently requested to reset your password. Click the button below to proceed.
                                </p>
                            </div>
                            <div style="padding: 30px 30px 20px 30px; text-align: center;">
                                <a href="${uri}" style="display: inline-block; padding: 14px 28px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px;">
                                    Reset Your Password
                                </a>
                            </div>
                            <div style="padding: 20px 30px 30px 30px; text-align: center;">
                                <p style="margin-top: 0; margin-bottom: 10px; color: #777777; font-size: 14px; line-height: 1.4;">
                                    This password reset link will expire in 24 hours.
                                </p>
                                <p style="margin-top: 0; margin-bottom: 20px; color: #777777; font-size: 14px; line-height: 1.4;">
                                    If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.
                                </p>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
  return emailHTML;
};
