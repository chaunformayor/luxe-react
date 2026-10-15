import { createHash } from "crypto";
import { degrees, PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";
import type { SignatureEvent, SignatureRequest, SignatureSigner } from "../../drizzle/schema";

export function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Loads a PDF to check it's usable; throws a readable error otherwise. */
export async function inspectPdf(bytes: Uint8Array) {
  try {
    const pdf = await PDFDocument.load(bytes);
    return { pageCount: pdf.getPageCount() };
  } catch (err: any) {
    if (/encrypt/i.test(err?.message ?? "")) {
      throw new Error("This PDF is password-protected or encrypted. Save an unlocked copy and try again.");
    }
    throw new Error("That file isn't a readable PDF.");
  }
}

const TZ = "America/Chicago";
const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, dateStyle: "medium", timeStyle: "long" });
export function formatWhen(value: Date | string | null | undefined) {
  return value ? dateFmt.format(new Date(value)) : "—";
}

const PAGE = { width: 612, height: 792, margin: 54 };
const INK = rgb(0.1, 0.12, 0.18);
const MUTED = rgb(0.42, 0.45, 0.5);
const GOLD = rgb(0.79, 0.66, 0.3);
const RULE = rgb(0.85, 0.86, 0.88);

/** Standard PDF fonts only cover Latin-1; swap anything else for "?" instead of throwing. */
function makeSafe(font: PDFFont) {
  const cache = new Map<string, boolean>();
  return (text: string) =>
    Array.from(text.replace(/[\r\n\t]+/g, " "))
      .map((ch) => {
        if (!cache.has(ch)) {
          try {
            font.encodeText(ch);
            cache.set(ch, true);
          } catch {
            cache.set(ch, false);
          }
        }
        return cache.get(ch) ? ch : "?";
      })
      .join("");
}

class Writer {
  page!: PDFPage;
  y = 0;
  private safe: (t: string) => string;

  constructor(private pdf: PDFDocument, private regular: PDFFont, private bold: PDFFont, private footer: string) {
    this.safe = makeSafe(regular);
    this.newPage();
  }

  newPage() {
    this.page = this.pdf.addPage([PAGE.width, PAGE.height]);
    this.y = PAGE.height - PAGE.margin;
    this.page.drawText(this.safe(this.footer), { x: PAGE.margin, y: 28, size: 7, font: this.regular, color: MUTED });
  }

  ensure(space: number) {
    if (this.y - space < PAGE.margin) this.newPage();
  }

  gap(points: number) {
    this.y -= points;
  }

  text(value: string, opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; x?: number; width?: number } = {}) {
    const size = opts.size ?? 10;
    const font = opts.bold ? this.bold : this.regular;
    const x = opts.x ?? PAGE.margin;
    const width = opts.width ?? PAGE.width - PAGE.margin - x;
    const lineHeight = size * 1.35;
    const words = this.safe(value).split(" ");
    let line = "";
    const flush = () => {
      this.ensure(lineHeight);
      this.y -= lineHeight;
      this.page.drawText(line, { x, y: this.y, size, font, color: opts.color ?? INK });
      line = "";
    };
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > width && line) {
        flush();
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) flush();
  }

  /** Label/value row with the value wrapped in its own column. */
  field(label: string, value: string, labelWidth = 120) {
    const columnWidth = PAGE.width - PAGE.margin * 2 - labelWidth;
    const lines = Math.ceil(this.regular.widthOfTextAtSize(this.safe(value), 9) / columnWidth) + 1;
    this.ensure(lines * 9 * 1.35 + 4); // keep the whole row on one page
    const top = this.y;
    this.text(label, { size: 9, color: MUTED, width: labelWidth - 8 });
    const afterLabel = this.y;
    this.y = top;
    this.text(value, { size: 9, x: PAGE.margin + labelWidth });
    this.y = Math.min(this.y, afterLabel);
  }

  rule() {
    this.ensure(10);
    this.y -= 6;
    this.page.drawLine({
      start: { x: PAGE.margin, y: this.y },
      end: { x: PAGE.width - PAGE.margin, y: this.y },
      thickness: 0.6,
      color: RULE,
    });
    this.y -= 6;
  }
}

function stampDocumentId(page: PDFPage, text: string, font: PDFFont) {
  const { width: w, height: h } = page.getSize();
  const rotation = ((page.getRotation().angle % 360) + 360) % 360;
  const opts = { size: 7, font, color: rgb(0.45, 0.45, 0.45) };
  // Position so the stamp reads upright in the top-left corner however the page is rotated.
  if (rotation === 90) page.drawText(text, { ...opts, x: 14, y: 18, rotate: degrees(90) });
  else if (rotation === 180) page.drawText(text, { ...opts, x: w - 18, y: 14, rotate: degrees(180) });
  else if (rotation === 270) page.drawText(text, { ...opts, x: w - 14, y: h - 18, rotate: degrees(270) });
  else page.drawText(text, { ...opts, x: 18, y: h - 14 });
}

function dataUrlToPng(dataUrl: string) {
  return Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64");
}

const EVENT_LABELS: Record<string, string> = {
  created: "Request created",
  sent: "Signing link emailed",
  email_failed: "Signing email could not be sent",
  link_copied: "Signing link copied by Luxe staff",
  viewed: "Document opened",
  consented: "Agreed to use electronic records and signatures",
  signed: "Signed",
  declined: "Declined to sign",
  reminder_sent: "Reminder emailed",
  voided: "Request cancelled",
  finalize_failed: "Finishing the signed copy failed and was retried",
  completed: "All signatures collected",
};

export type FinalizeInput = {
  source: Uint8Array;
  request: SignatureRequest;
  signers: SignatureSigner[];
  events: SignatureEvent[];
  completedAt: Date;
};

/** Original pages (stamped with the e-sign ID) + signature page + certificate of completion. */
export async function buildSignedPdf({ source, request, signers, events, completedAt }: FinalizeInput) {
  const pdf = await PDFDocument.load(source);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const safe = makeSafe(regular);
  const idText = `Luxe e-Sign ID: ${request.id}`;

  for (const page of pdf.getPages()) stampDocumentId(page, idText, regular);

  const ordered = [...signers].sort((a, b) => a.signOrder - b.signOrder || a.name.localeCompare(b.name));
  const footer = `${idText} · ${request.title}`;

  // ── Signature page ──────────────────────────────────────────────────────────
  const w = new Writer(pdf, regular, bold, footer);
  w.text("SIGNATURE PAGE", { size: 9, bold: true, color: GOLD });
  w.gap(2);
  w.text(request.title, { size: 16, bold: true });
  w.gap(4);
  w.text(
    `This signature page is part of and incorporated into the document above. It was signed electronically through Luxe Property Solutions. Original document SHA-256: ${request.sourceSha256}`,
    { size: 8.5, color: MUTED }
  );
  w.rule();

  for (const signer of ordered) {
    w.ensure(150);
    w.gap(6);
    w.text((signer.roleLabel || "Signer").toUpperCase(), { size: 8, bold: true, color: MUTED });
    w.gap(4);
    if (signer.signatureImage) {
      const png = await pdf.embedPng(dataUrlToPng(signer.signatureImage));
      const scale = Math.min(220 / png.width, 64 / png.height, 1);
      const height = png.height * scale;
      w.page.drawImage(png, { x: PAGE.margin, y: w.y - height, width: png.width * scale, height });
      w.y -= height;
    }
    w.page.drawLine({
      start: { x: PAGE.margin, y: w.y - 2 },
      end: { x: PAGE.margin + 260, y: w.y - 2 },
      thickness: 0.8,
      color: INK,
    });
    w.gap(6);
    w.field("Name", signer.printedName || signer.name);
    w.field("Email", signer.email);
    w.field("Signed", formatWhen(signer.signedAt));
    w.gap(10);
  }

  // ── Certificate of completion ───────────────────────────────────────────────
  w.newPage();
  w.text("CERTIFICATE OF COMPLETION", { size: 9, bold: true, color: GOLD });
  w.gap(2);
  w.text(request.title, { size: 16, bold: true });
  w.gap(8);
  w.field("e-Sign ID", request.id);
  w.field("Original SHA-256", request.sourceSha256 ?? "—");
  w.field("Original pages", String(request.sourcePageCount ?? "—"));
  w.field("Sent by", `${request.createdByName || "Luxe Property Solutions"}${request.createdByEmail ? ` (${request.createdByEmail})` : ""}, Luxe Property Solutions`);
  w.field("Sent", formatWhen(request.createdAt));
  w.field("Completed", formatWhen(completedAt));
  w.field("Time zone", `${TZ} (Central)`);
  w.rule();

  w.text("SIGNERS", { size: 9, bold: true, color: MUTED });
  for (const signer of ordered) {
    w.ensure(120);
    w.gap(8);
    w.text(`${signer.printedName || signer.name} · ${signer.roleLabel || "Signer"}`, { size: 10.5, bold: true });
    w.field("Email", signer.email);
    w.field("Invited to sign", formatWhen(signer.sentAt));
    w.field("Opened", formatWhen(signer.viewedAt));
    w.field("Consented to e-sign", formatWhen(signer.consentedAt));
    w.field("Signed", formatWhen(signer.signedAt));
    w.field("Signature", signer.signatureMethod === "typed" ? "Typed name, adopted as signature" : "Drawn by hand");
    w.field("IP address", signer.signedIp || "—");
    w.field("Device", (signer.signedUserAgent || "—").slice(0, 160));
  }
  w.rule();

  w.text("EVENT HISTORY", { size: 9, bold: true, color: MUTED });
  w.gap(4);
  const nameById = new Map(signers.map((s) => [s.id, s.printedName || s.name]));
  const history = [...events].sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
  for (const event of history) {
    const who = event.signerId ? `${nameById.get(event.signerId) ?? "Signer"}: ` : "";
    const ip = event.ip ? ` (IP ${event.ip})` : "";
    w.text(safe(`${formatWhen(event.createdAt)} — ${who}${EVENT_LABELS[event.event] ?? event.event}${ip}`), { size: 8.5 });
  }
  w.text(`${formatWhen(completedAt)} — ${EVENT_LABELS.completed}`, { size: 8.5 });
  w.rule();

  w.text(
    "Each signer received a unique link by email, agreed to use electronic records and signatures, and adopted the signature shown on the signature page. Electronic signatures and records are legally valid under the federal ESIGN Act and the Missouri Uniform Electronic Transactions Act. A paper copy is available on request from info@luxestl.com.",
    { size: 8.5, color: MUTED }
  );

  return pdf.save();
}

/** Throws if the data URL isn't a reasonably sized PNG that pdf-lib can embed. */
export async function validateSignaturePng(dataUrl: string) {
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) throw new Error("Invalid signature image.");
  const bytes = dataUrlToPng(dataUrl);
  if (bytes.length < 100 || bytes.length > 400_000) throw new Error("Invalid signature image.");
  const probe = await PDFDocument.create();
  await probe.embedPng(bytes);
}
