import { betterAuth, BetterAuthOptions } from "better-auth";
import { getDatabase } from "./mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { VerificationEmail, VerificationChangeEmail, ForgetPasswordEmail } from "@/components/email-template";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const db = await getDatabase(process.env.DEFAULT_DATABASE);

export const auth = betterAuth({
    database: mongodbAdapter(db),
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24 * 7,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        }
    },
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async ({ newEmail, url }) => {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: newEmail,
                    subject: "Verify your new email address",
                    html: VerificationChangeEmail({ username: "", uri: url })
                }
                try {
                    await transporter.sendMail(mailOptions);
                }
                catch (error) {
                    console.error(error);
                }
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Reset your password",
                html: ForgetPasswordEmail({ username: user.name, uri: url })
            }
            try {
                await transporter.sendMail(mailOptions);
            }
            catch (error) {
                console.error(error);
            }
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, token }) => {
            const verificationURL = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Verify your email address",
                html: VerificationEmail({ username: user.name, uri: verificationURL })
            }
            try {
                await transporter.sendMail(mailOptions);
            }
            catch (error) {
                console.error(error);
            }
        }
    }
} satisfies BetterAuthOptions);


export async function getUser(req: Request) {
    const session = await auth.api.getSession(req);
    return session || null;
}
