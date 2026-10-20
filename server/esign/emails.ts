import { emailButton, emailShell, escapeHtml, sendEmail, type EmailAttachment } from "../email";

export function siteUrl() {
  return (process.env.PUBLIC_SITE_URL || "https://www.luxestl.com").replace(/\/+$/, "");
}

export function signingUrl(token: string) {
  return `${siteUrl()}/sign/${token}`;
}

function replyTo() {
  return { email: process.env.ADMIN_NOTIFY_EMAIL || "info@luxestl.com", name: "Luxe Property Solutions" };
}

function adminEmail() {
  return process.env.ADMIN_NOTIFY_EMAIL || "info@luxestl.com";
}

const p = (html: string) => `<p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">${html}</p>`;
const note = (html: string) =>
  `<div style="background:#f8f9fa;border-left:4px solid #C9A84C;padding:14px 18px;border-radius:0 6px 6px 0;margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">${html}</div>`;
const small = (html: string) => `<p style="margin:16px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">${html}</p>`;

type Invite = { to: string; name: string; title: string; token: string; senderName: string; message?: string | null; fillsDetails?: boolean };

export async function sendSigningInvite(i: Invite, reminder = false) {
  const body = [
    p(`Hi ${escapeHtml(i.name)},`),
    p(
      reminder
        ? `This is a friendly reminder that <strong>${escapeHtml(i.title)}</strong> is still waiting for your signature.`
        : `${escapeHtml(i.senderName)} at Luxe Property Solutions sent you <strong>${escapeHtml(i.title)}</strong> to review and sign electronically.`
    ),
    i.message ? note(escapeHtml(i.message)) : "",
    i.fillsDetails ? p("First you'll fill in a few details (like your contact and insurance information); then you'll review the finished document and sign.") : "",
    emailButton(signingUrl(i.token), i.fillsDetails ? "Fill In & Sign" : "Review & Sign"),
    small("This link is unique to you, so please don't forward it. Signing takes about a minute on a phone or computer. Questions? Just reply to this email."),
  ].join("");

  return sendEmail({
    to: i.to,
    toName: i.name,
    replyTo: replyTo(),
    subject: `${reminder ? "Reminder: please sign" : "Please sign"}: ${i.title}`,
    html: emailShell({ heading: "Luxe Property Solutions", subheading: "Document ready for your signature", body }),
  });
}

export async function sendCompletedCopy(opts: {
  to: string;
  name: string;
  title: string;
  finalSha256: string;
  attachment: EmailAttachment | null;
  link: string;
}) {
  const body = [
    p(`Hi ${escapeHtml(opts.name)},`),
    p(`Everyone has signed <strong>${escapeHtml(opts.title)}</strong>. ${opts.attachment ? "Your copy is attached." : "Download your copy below."}`),
    emailButton(opts.link, opts.attachment ? "View online" : "Download signed copy"),
    small(`Keep this email for your records. Signed file fingerprint (SHA-256): ${escapeHtml(opts.finalSha256)}`),
  ].join("");

  return sendEmail({
    to: opts.to,
    toName: opts.name,
    replyTo: replyTo(),
    subject: `Completed: ${opts.title}`,
    html: emailShell({ heading: "Luxe Property Solutions", subheading: "Signed document", body }),
    attachments: opts.attachment ? [opts.attachment] : undefined,
  });
}

export async function sendDeclinedNotice(opts: { title: string; signerName: string; signerEmail: string; reason: string | null }) {
  const body = [
    p(`<strong>${escapeHtml(opts.signerName)}</strong> (${escapeHtml(opts.signerEmail)}) declined to sign <strong>${escapeHtml(opts.title)}</strong>.`),
    opts.reason ? note(escapeHtml(opts.reason)) : "",
    emailButton(`${siteUrl()}/admin/esign`, "Open E-Signatures"),
  ].join("");

  return sendEmail({
    to: adminEmail(),
    toName: "Luxe Property Solutions",
    subject: `Declined: ${opts.title}`,
    html: emailShell({ heading: "Signature Declined", subheading: "Luxe Property Solutions", body }),
  });
}

export async function sendVoidedNotice(opts: { to: string; name: string; title: string; reason: string | null }) {
  const body = [
    p(`Hi ${escapeHtml(opts.name)},`),
    p(`Luxe Property Solutions cancelled the signature request for <strong>${escapeHtml(opts.title)}</strong>. No action is needed, and the earlier signing link no longer works.`),
    opts.reason ? note(escapeHtml(opts.reason)) : "",
  ].join("");

  return sendEmail({
    to: opts.to,
    toName: opts.name,
    replyTo: replyTo(),
    subject: `Cancelled: ${opts.title}`,
    html: emailShell({ heading: "Luxe Property Solutions", subheading: "Signature request cancelled", body }),
  });
}

export function adminRecipient() {
  return adminEmail();
}
