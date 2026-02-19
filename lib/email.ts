import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email sending.');
        return; // Or throw error depending on desired behavior
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Prog3 Blog <onboarding@resend.dev>', // Verify domain on Resend dashboard in production
            to: [email],
            subject: 'Verify your email address',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Welcome to Prog3 Blog!</h1>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${verificationUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
                    <p style="margin-top: 24px;">Or copy and paste this link into your browser:</p>
                    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend Error:', error);
            throw new Error('Failed to send verification email');
        }

        return data;
    } catch (e) {
        console.error('Email Sending Exception:', e);
        // In development without API key, we might want to just log the link
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV] Verification Link for ${email}: ${verificationUrl}`);
        }
        throw e;
    }
}
