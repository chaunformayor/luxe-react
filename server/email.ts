import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const FROM_NAME = "Luxe Property Solutions";

function getSESClient() {
  return new SESv2Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

function getFromEmail() {
  return process.env.SES_FROM_EMAIL || "noreply@luxestl.com";
}

async function sendEmail(opts: {
  to: string;
  toName: string;
  subject: string;
  html: string;
}) {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKey || !secretKey) {
    console.warn("[Email] AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY not set — skipping email");
    return;
  }

  const client = getSESClient();
  const command = new SendEmailCommand({
    FromEmailAddress: `${FROM_NAME} <${getFromEmail()}>`,
    Destination: { ToAddresses: [opts.to] },
    Content: {
      Simple: {
        Subject: { Data: opts.subject, Charset: "UTF-8" },
        Body: { Html: { Data: opts.html, Charset: "UTF-8" } },
      },
    },
  });

  await client.send(command);
}

export async function sendTestEmail(to: string): Promise<{
  credentialsSet: boolean;
  fromEmail: string;
  to: string;
  region: string;
  error?: string;
}> {
  const credentialsSet = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  const fromEmail = getFromEmail();
  const region = process.env.AWS_REGION || "us-east-1";

  if (!credentialsSet) {
    return { credentialsSet, fromEmail, to, region, error: "AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY env var is not set" };
  }

  try {
    await sendEmail({
      to,
      toName: "Luxe Admin",
      subject: "Luxe Property Solutions — Test Email",
      html: `<p style="font-family:Arial;font-size:15px;">This is a test email from <strong>Luxe Property Solutions</strong> via AWS SES.<br>If you received this, SES is configured correctly.</p>`,
    });
    return { credentialsSet, fromEmail, to, region };
  } catch (err: any) {
    return { credentialsSet, fromEmail, to, region, error: err.message };
  }
}

export async function sendOwnerWelcomeEmail({
  to,
  name,
  tempPassword,
}: {
  to: string;
  name: string;
  tempPassword: string;
}) {
  await sendEmail({
    to,
    toName: name,
    subject: "Welcome to Your Luxe Owner Portal",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#0A1628;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#C9A84C;font-size:26px;font-weight:700;">Luxe Property Solutions</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">Property Owner Portal</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#0A1628;font-size:22px;">Welcome, ${name}!</h2>
            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
              Your owner account has been created. Log in to manage your properties and track tenant activity.
            </p>
            <div style="background:#0A1628;border-radius:8px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 16px;color:#C9A84C;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your Login Credentials</p>
              <p style="margin:0 0 8px;color:#e2e8f0;font-size:14px;"><span style="color:#94a3b8;">Email:</span> ${to}</p>
              <p style="margin:0;color:#e2e8f0;font-size:14px;"><span style="color:#94a3b8;">Temp Password:</span> <strong style="color:#C9A84C;">${tempPassword}</strong></p>
            </div>
            <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">You will be prompted to create a new password on your first login.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="https://luxestl.com/owner-login"
                 style="display:inline-block;background:#C9A84C;color:#0A1628;font-weight:700;font-size:15px;padding:14px 32px;border-radius:6px;text-decoration:none;">
                Sign In to Owner Portal
              </a>
            </div>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
              Need help? Contact <a href="mailto:info@luxestl.com" style="color:#C9A84C;">info@luxestl.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 Luxe Property Solutions · St. Louis, MO</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
  tempPassword,
  unitAddress,
}: {
  to: string;
  name: string;
  tempPassword: string;
  unitAddress: string;
}) {
  await sendEmail({
    to,
    toName: name,
    subject: "Welcome to Your Luxe Tenant Portal",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#0A1628;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#C9A84C;font-size:26px;font-weight:700;">Luxe Property Solutions</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">Tenant Portal Access</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#0A1628;font-size:22px;">Welcome, ${name}!</h2>
            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
              Your rental application has been approved. Your tenant portal account is ready.
            </p>
            <div style="background:#f8f9fa;border-left:4px solid #C9A84C;padding:16px 20px;border-radius:0 6px 6px 0;margin-bottom:28px;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your Unit</p>
              <p style="margin:6px 0 0;color:#0A1628;font-size:16px;font-weight:600;">${unitAddress}</p>
            </div>
            <div style="background:#0A1628;border-radius:8px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 16px;color:#C9A84C;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your Login Credentials</p>
              <p style="margin:0 0 8px;color:#e2e8f0;font-size:14px;"><span style="color:#94a3b8;">Email:</span> ${to}</p>
              <p style="margin:0;color:#e2e8f0;font-size:14px;"><span style="color:#94a3b8;">Temp Password:</span> <strong style="color:#C9A84C;">${tempPassword}</strong></p>
            </div>
            <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">You will be prompted to create a new password on your first login.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="https://luxestl.com/login"
                 style="display:inline-block;background:#C9A84C;color:#0A1628;font-weight:700;font-size:15px;padding:14px 32px;border-radius:6px;text-decoration:none;">
                Sign In to Your Portal
              </a>
            </div>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
              Need help? <a href="mailto:info@luxestl.com" style="color:#C9A84C;">info@luxestl.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 Luxe Property Solutions · St. Louis, MO</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendContactNotificationEmail({
  fromName,
  fromEmail,
  phone,
  propertyType,
  message,
}: {
  fromName: string;
  fromEmail: string;
  phone?: string;
  propertyType?: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "info@luxestl.com";
  await sendEmail({
    to: adminEmail,
    toName: "Luxe Property Solutions",
    subject: `New Contact Form Submission from ${fromName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#0A1628;padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#C9A84C;font-size:22px;font-weight:700;">New Contact Inquiry</h1>
            <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">Luxe Property Solutions</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:16px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">From</p>
                  <p style="margin:0;color:#0A1628;font-size:15px;font-weight:600;">${fromName}</p>
                  <p style="margin:4px 0 0;color:#4b5563;font-size:14px;">${fromEmail}</p>
                  ${phone ? `<p style="margin:4px 0 0;color:#4b5563;font-size:14px;">${phone}</p>` : ""}
                  ${propertyType ? `<p style="margin:4px 0 0;color:#4b5563;font-size:13px;">Interest: ${propertyType}</p>` : ""}
                </td>
              </tr>
              <tr>
                <td style="padding-top:20px;">
                  <p style="margin:0 0 10px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Message</p>
                  <p style="margin:0;color:#1f2937;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
                </td>
              </tr>
            </table>
            <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;">
              <a href="mailto:${fromEmail}" style="display:inline-block;background:#C9A84C;color:#0A1628;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;">
                Reply to ${fromName}
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 Luxe Property Solutions · St. Louis, MO</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
