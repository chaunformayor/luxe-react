import { MailerooClient } from "maileroo";

function getMaileroo() {
  if (!process.env.MAILEROO_API_KEY) return null;
  return MailerooClient.getClient(process.env.MAILEROO_API_KEY);
}

const FROM_NAME = "Luxe Property Solutions";
const FROM_EMAIL = process.env.MAILEROO_FROM_EMAIL || "noreply@luxestl.com";

export async function sendOwnerWelcomeEmail({
  to,
  name,
  tempPassword,
}: {
  to: string;
  name: string;
  tempPassword: string;
}) {
  const client = getMaileroo();
  if (!client) {
    console.warn("[Email] MAILEROO_API_KEY not set — skipping owner welcome email");
    return;
  }

  await client
    .setFrom(FROM_NAME, FROM_EMAIL)
    .setTo(name, to)
    .setSubject("Welcome to Your Luxe Owner Portal")
    .setHtml(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'DM Sans',Arial,sans-serif;">
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
              Your owner account has been set up. Log in to the owner portal to manage your properties, view tenant activity, and track financials.
            </p>
            <div style="background:#0A1628;border-radius:8px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 16px;color:#C9A84C;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your Login Credentials</p>
              <p style="margin:0 0 8px;color:#e2e8f0;font-size:14px;"><span style="color:#94a3b8;">Email:</span> ${to}</p>
              <p style="margin:0;color:#e2e8f0;font-size:14px;"><span style="color:#94a3b8;">Temp Password:</span> <strong style="color:#C9A84C;">${tempPassword}</strong></p>
            </div>
            <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">You will be prompted to create a new password on your first login.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="https://luxe-react.vercel.app/owner-login"
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
</html>`)
    .send();
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
  const client = getMaileroo();
  if (!client) {
    console.warn("[Email] MAILEROO_API_KEY not set — skipping welcome email");
    return;
  }

  await client
    .setFrom(FROM_NAME, FROM_EMAIL)
    .setTo(name, to)
    .setSubject("Welcome to Your Luxe Tenant Portal")
    .setHtml(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#0A1628;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#C9A84C;font-size:26px;font-weight:700;letter-spacing:0.5px;">Luxe Property Solutions</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">Tenant Portal Access</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#0A1628;font-size:22px;">Welcome, ${name}!</h2>
            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
              Your rental application has been approved. Your tenant portal account is ready — log in to view your lease details, submit maintenance requests, and manage payments.
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
              <a href="https://luxe-react.vercel.app/login"
                 style="display:inline-block;background:#C9A84C;color:#0A1628;font-weight:700;font-size:15px;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;">
                Sign In to Your Portal
              </a>
            </div>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
              Need help? Contact us at <a href="mailto:info@luxestl.com" style="color:#C9A84C;">info@luxestl.com</a>
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
</html>`)
    .send();
}
