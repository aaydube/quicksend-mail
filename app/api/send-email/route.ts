import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const {
      recipientEmail,
      subject,
      body,
      senderEmail,
      smtpUser,
      smtpPass,
      smtpHost = 'smtp.gmail.com',
      smtpPort = 465,
      resumeFileName,
      resumeFileDataUrl,
    } = await req.json();

    if (!recipientEmail || !subject || !body) {
      return NextResponse.json(
        { error: 'Recipient email, subject, and body are required.' },
        { status: 400 }
      );
    }

    const user = smtpUser || senderEmail || process.env.SMTP_USER;
    const pass = smtpPass || process.env.SMTP_PASS;

    if (!user || !pass) {
      return NextResponse.json(
        {
          error:
            'SMTP credentials missing. Please configure your Gmail App Password in Sender Profile settings.',
        },
        { status: 401 }
      );
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });

    // Prepare attachments if resume PDF data URL is provided
    const attachments: Array<{ filename: string; content: Buffer }> = [];
    if (resumeFileDataUrl && resumeFileName) {
      try {
        const matches = resumeFileDataUrl.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches[2]) {
          const buffer = Buffer.from(matches[2], 'base64');
          attachments.push({
            filename: resumeFileName,
            content: buffer,
          });
        }
      } catch (err) {
        console.error('Error processing resume attachment:', err);
      }
    }

    // Send email
    const mailOptions = {
      from: `"${user.split('@')[0]}" <${user}>`,
      to: recipientEmail,
      subject: subject,
      text: body,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Email sent successfully to ${recipientEmail}`,
    });
  } catch (error: any) {
    console.error('Nodemailer send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email via SMTP.' },
      { status: 500 }
    );
  }
}
