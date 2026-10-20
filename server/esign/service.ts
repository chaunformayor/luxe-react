import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  documentTemplates,
  signatureEvents,
  signatureRequests,
  signatureSigners,
  type SignatureRequest,
  type SignatureSigner,
} from "../../drizzle/schema";
import * as nc from "../nextcloud";
import { FOLDERS, createDocumentRecord, getOwnerParty, getPropertyParty, getTenantParty, requireDb } from "../documentsRouter";
import { buildSignedPdf, inspectPdf, sha256, validateSignaturePng } from "./pdf";
import { docxToPdf, extractFields, fillDocx } from "./docx";
import { labelFor, resolveFieldValues, type FieldContext } from "./fields";
import { isDefaultable } from "@shared/templateFields";
import {
  adminRecipient,
  sendCompletedCopy,
  sendDeclinedNotice,
  sendSigningInvite,
  sendVoidedNotice,
  signingUrl,
  siteUrl,
} from "./emails";

export type Audit = { ip?: string | null; userAgent?: string | null };
type Category = SignatureRequest["category"];

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function affectedRows(result: unknown): number {
  const header = Array.isArray(result) ? result[0] : result;
  return (header as { affectedRows?: number } | undefined)?.affectedRows ?? 0;
}

/** Calendar date in St. Louis, e.g. 2026-10-15 — used in file names. */
function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
}

async function logEvent(requestId: string, event: string, opts: { signerId?: string | null; detail?: string | null; audit?: Audit } = {}) {
  const db = await requireDb();
  await db.insert(signatureEvents).values({
    id: newId("sev"),
    requestId,
    signerId: opts.signerId ?? null,
    event,
    detail: opts.detail?.slice(0, 2000) ?? null,
    ip: opts.audit?.ip?.slice(0, 64) ?? null,
    userAgent: opts.audit?.userAgent?.slice(0, 500) ?? null,
    createdAt: new Date(),
  });
}

export async function getRequest(id: string) {
  const db = await requireDb();
  const [row] = await db.select().from(signatureRequests).where(eq(signatureRequests.id, id)).limit(1);
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Signature request not found." });
  return row;
}

async function getSigners(requestId: string) {
  const db = await requireDb();
  return db.select().from(signatureSigners).where(eq(signatureSigners.requestId, requestId)).orderBy(asc(signatureSigners.signOrder));
}

async function getEvents(requestId: string) {
  const db = await requireDb();
  return db.select().from(signatureEvents).where(eq(signatureEvents.requestId, requestId)).orderBy(asc(signatureEvents.createdAt));
}

async function defaultFolder(category: Category, links: PartyLinks, firstSignerName: string) {
  if (links.tenantId) return (await getTenantParty(links.tenantId)).folder;
  if (links.ownerUserId) return (await getOwnerParty(links.ownerUserId)).folder;
  if (links.propertyId) return (await getPropertyParty(links.propertyId)).folder;
  const name = nc.safeName(firstSignerName);
  if (category === "lease") return nc.joinPath(FOLDERS.tenants, name);
  if (category === "management_agreement") return nc.joinPath(FOLDERS.owners, name);
  if (category === "lien_waiver" || category === "w9") return nc.joinPath(FOLDERS.vendors, name);
  return nc.joinPath("/Signed Documents", name);
}

// ── Templates ────────────────────────────────────────────────────────────────

export async function listTemplates(includeArchived = false) {
  const db = await requireDb();
  const rows = await db.select().from(documentTemplates).orderBy(asc(documentTemplates.name));
  return includeArchived ? rows : rows.filter((t) => t.active);
}

export async function createTemplate(
  input: { fileId: string; path: string; name: string; category: (typeof documentTemplates.$inferInsert)["category"]; signerRoles: string[]; description?: string },
  adminId: string
) {
  const bytes = await nc.downloadByFileId(input.fileId);
  const format = /\.docx$/i.test(input.path) ? "docx" : "pdf";
  let fields: string[] | null = null;
  let pageCount: number | null = null;
  let warning: string | null = null;

  if (format === "docx") {
    fields = extractFields(bytes);
    // Trial conversion: proves the converter works and gives a page count. The template is
    // still saved if the converter is down, since it can be fixed before the first send.
    try {
      pageCount = (await inspectPdf(await docxToPdf(fillDocx(bytes, {})))).pageCount;
    } catch (err: any) {
      warning = err?.message ?? "The Word-to-PDF converter couldn't process this template.";
    }
  } else {
    pageCount = (await inspectPdf(bytes)).pageCount;
  }

  const db = await requireDb();
  const id = newId("tpl");
  await db.insert(documentTemplates).values({
    id,
    name: input.name.trim(),
    category: input.category,
    description: input.description?.trim() || null,
    nextcloudPath: nc.normalizePath(input.path),
    nextcloudFileId: input.fileId,
    pageCount,
    signerRoles: input.signerRoles.map((r) => r.trim()).filter(Boolean),
    format,
    fields,
    active: true,
    createdBy: adminId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { id, fields, warning };
}

async function activeTemplate(templateId: string) {
  const db = await requireDb();
  const [template] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, templateId)).limit(1);
  if (!template?.active) throw new TRPCError({ code: "NOT_FOUND", message: "That template no longer exists." });
  return template;
}

/** A Word template's placeholders, pre-filled with whatever the site knows about this tenant/owner/property. */
export async function templateFieldsFor(templateId: string, ctx: FieldContext) {
  const template = await activeTemplate(templateId);
  const known = await resolveFieldValues(ctx);
  const defaults = template.fieldDefaults ?? {};
  return (template.fields ?? []).map((key) => {
    const source = key in known ? ("site" as const) : defaults[key] ? ("default" as const) : null;
    return { key, label: labelFor(key), value: known[key] ?? defaults[key] ?? "", source };
  });
}

/** Remembers policy-type values (fees, terms) so they pre-fill next time this template is sent. */
export async function saveFieldDefaults(templateId: string, values: Record<string, string>) {
  const template = await activeTemplate(templateId);
  const allowed = new Set((template.fields ?? []).filter(isDefaultable));
  const fieldDefaults = Object.fromEntries(Object.entries(values).filter(([k, v]) => allowed.has(k) && v.trim()));
  const db = await requireDb();
  await db.update(documentTemplates).set({ fieldDefaults, updatedAt: new Date() }).where(eq(documentTemplates.id, templateId));
  return { saved: Object.keys(fieldDefaults) };
}

async function renderTemplatePdf(template: { nextcloudFileId: string }, values: Record<string, string>) {
  const docx = await nc.downloadByFileId(template.nextcloudFileId);
  return docxToPdf(fillDocx(docx, values));
}

export async function previewTemplate(templateId: string, values: Record<string, string>) {
  const template = await activeTemplate(templateId);
  if (template.format !== "docx") throw new TRPCError({ code: "BAD_REQUEST", message: "Only Word templates have a filled-in preview." });
  return renderTemplatePdf(template, values);
}

export async function updateTemplate(
  id: string,
  data: Partial<{ name: string; category: (typeof documentTemplates.$inferInsert)["category"]; signerRoles: string[]; description: string | null; active: boolean }>
) {
  const db = await requireDb();
  await db
    .update(documentTemplates)
    .set({
      ...data,
      ...(data.signerRoles ? { signerRoles: data.signerRoles.map((r) => r.trim()).filter(Boolean) } : {}),
      updatedAt: new Date(),
    })
    .where(eq(documentTemplates.id, id));
}

// ── Creating & sending ───────────────────────────────────────────────────────

export type SourceInput =
  | { kind: "template"; templateId: string }
  | { kind: "file"; fileId: string }
  | { kind: "upload"; fileId: string; path: string };

type PartyLinks = { tenantId?: string | null; ownerUserId?: string | null; propertyId?: string | null };

export type CreateInput = PartyLinks & {
  title: string;
  category: Exclude<Category, "w9">;
  source: SourceInput;
  signers: { name: string; email: string; roleLabel?: string }[];
  sequential: boolean;
  message?: string;
  /** Values for a Word template's {{placeholders}}. */
  fieldValues?: Record<string, string>;
};

export async function createSignatureRequest(input: CreateInput, admin: { id: string; name: string | null; email: string | null }) {
  const db = await requireDb();

  let templateId: string | null = null;
  let bytes: Uint8Array;
  if (input.source.kind === "template") {
    const template = await activeTemplate(input.source.templateId);
    templateId = template.id;
    bytes =
      template.format === "docx"
        ? await renderTemplatePdf(template, input.fieldValues ?? {})
        : await nc.downloadByFileId(template.nextcloudFileId);
  } else {
    bytes = await nc.downloadByFileId(input.source.fileId);
  }

  const { pageCount } = await inspectPdf(bytes);

  // Freeze a private copy so later edits to a template or shared file can't change what was signed.
  let source: { fileId: string; path: string };
  if (input.source.kind === "upload") {
    source = { fileId: input.source.fileId, path: nc.normalizePath(input.source.path) };
  } else {
    const copy = await nc.uploadFile(nc.joinPath(FOLDERS.esign, `${today()} ${nc.safeName(input.title)}.pdf`), bytes, "application/pdf");
    source = { fileId: copy.fileId, path: copy.path };
  }

  const id = newId("esr");
  const now = new Date();
  await db.insert(signatureRequests).values({
    id,
    title: input.title.trim(),
    kind: "document",
    category: input.category,
    status: "sent",
    message: input.message?.trim() || null,
    templateId,
    sourcePath: source.path,
    sourceFileId: source.fileId,
    sourceSha256: sha256(bytes),
    sourcePageCount: pageCount,
    folderPath: await defaultFolder(input.category, input, input.signers[0].name),
    sequential: input.sequential,
    tenantId: input.tenantId || null,
    ownerUserId: input.ownerUserId || null,
    propertyId: input.propertyId || null,
    createdBy: admin.id,
    createdByName: admin.name,
    createdByEmail: admin.email,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(signatureSigners).values(
    input.signers.map((s, index) => ({
      id: newId("ess"),
      requestId: id,
      name: s.name.trim(),
      email: s.email.trim().toLowerCase(),
      roleLabel: s.roleLabel?.trim() || null,
      signOrder: input.sequential ? index + 1 : 1,
      token: randomBytes(32).toString("base64url"),
      status: "waiting" as const,
      createdAt: now,
    }))
  );

  await logEvent(id, "created", { detail: `${input.signers.length} signer(s), ${input.sequential ? "in order" : "all at once"}` });
  const { emailed, invited } = await sendNextSigners(id);
  return { id, emailed, invited };
}

async function emailSigner(request: SignatureRequest, signer: SignatureSigner, reminder: boolean) {
  try {
    const sent = await sendSigningInvite(
      {
        to: signer.email,
        name: signer.name,
        title: request.title,
        token: signer.token,
        senderName: request.createdByName || "Luxe Property Solutions",
        message: request.message,
      },
      reminder
    );
    await logEvent(request.id, sent ? (reminder ? "reminder_sent" : "sent") : "email_failed", {
      signerId: signer.id,
      detail: sent ? signer.email : "Email is not configured on the server",
    });
    return sent;
  } catch (err: any) {
    await logEvent(request.id, "email_failed", { signerId: signer.id, detail: err?.message });
    return false;
  }
}

/** Emails everyone in the lowest signing-order group that hasn't been sent yet. */
async function sendNextSigners(requestId: string) {
  const db = await requireDb();
  const request = await getRequest(requestId);
  const pending = (await getSigners(requestId)).filter((s) => s.status !== "signed");
  let emailed = 0;
  let invited = 0;
  if (!pending.length) return { emailed, invited };
  const nextOrder = Math.min(...pending.map((s) => s.signOrder));
  for (const signer of pending.filter((s) => s.signOrder === nextOrder && s.status === "waiting")) {
    await db.update(signatureSigners).set({ status: "sent", sentAt: new Date() }).where(eq(signatureSigners.id, signer.id));
    invited++;
    if (await emailSigner(request, { ...signer, status: "sent" }, false)) emailed++;
  }
  return { emailed, invited };
}

// ── Admin actions ────────────────────────────────────────────────────────────

export async function listRequests() {
  const db = await requireDb();
  const requests = await db.select().from(signatureRequests).orderBy(desc(signatureRequests.createdAt)).limit(300);
  const ids = requests.map((r) => r.id);
  const signers = ids.length
    ? await db
        .select({
          id: signatureSigners.id,
          requestId: signatureSigners.requestId,
          name: signatureSigners.name,
          email: signatureSigners.email,
          roleLabel: signatureSigners.roleLabel,
          signOrder: signatureSigners.signOrder,
          status: signatureSigners.status,
          sentAt: signatureSigners.sentAt,
          viewedAt: signatureSigners.viewedAt,
          signedAt: signatureSigners.signedAt,
          declinedAt: signatureSigners.declinedAt,
          declineReason: signatureSigners.declineReason,
          lastReminderAt: signatureSigners.lastReminderAt,
        })
        .from(signatureSigners)
        .where(inArray(signatureSigners.requestId, ids))
        .orderBy(asc(signatureSigners.signOrder))
    : [];

  // Did the most recent email to each signer fail? (So the admin knows to copy the link instead.)
  const emailEvents = ids.length
    ? await db
        .select({ signerId: signatureEvents.signerId, event: signatureEvents.event })
        .from(signatureEvents)
        .where(and(inArray(signatureEvents.requestId, ids), inArray(signatureEvents.event, ["sent", "reminder_sent", "email_failed"])))
        .orderBy(asc(signatureEvents.createdAt))
    : [];
  const lastEmail = new Map<string, string>();
  for (const e of emailEvents) if (e.signerId) lastEmail.set(e.signerId, e.event);

  return requests.map((r) => ({
    ...r,
    signers: signers
      .filter((s) => s.requestId === r.id)
      .map((s) => ({ ...s, emailFailed: lastEmail.get(s.id) === "email_failed" })),
  }));
}

export async function requestEvents(requestId: string) {
  return getEvents(requestId);
}

export async function remind(requestId: string, signerId?: string) {
  const request = await getRequest(requestId);
  if (request.status !== "sent") throw new TRPCError({ code: "BAD_REQUEST", message: "Only open requests can be reminded." });
  const db = await requireDb();
  const targets = (await getSigners(requestId)).filter(
    (s) => (s.status === "sent" || s.status === "viewed") && (!signerId || s.id === signerId)
  );
  if (!targets.length) throw new TRPCError({ code: "BAD_REQUEST", message: "Nobody is waiting to sign right now." });
  let sent = 0;
  for (const signer of targets) {
    if (await emailSigner(request, signer, true)) sent++;
    await db.update(signatureSigners).set({ lastReminderAt: new Date() }).where(eq(signatureSigners.id, signer.id));
  }
  return { sent, total: targets.length };
}

export async function signingLinkFor(signerId: string) {
  const db = await requireDb();
  const [signer] = await db.select().from(signatureSigners).where(eq(signatureSigners.id, signerId)).limit(1);
  if (!signer) throw new TRPCError({ code: "NOT_FOUND", message: "Signer not found." });
  await logEvent(signer.requestId, "link_copied", { signerId: signer.id });
  return signingUrl(signer.token);
}

export async function voidRequest(requestId: string, reason: string | undefined) {
  const db = await requireDb();
  const request = await getRequest(requestId);
  if (!["sent", "declined", "error"].includes(request.status)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "This request can't be cancelled." });
  }
  await db
    .update(signatureRequests)
    .set({ status: "voided", voidedAt: new Date(), voidReason: reason?.trim() || null, updatedAt: new Date() })
    .where(eq(signatureRequests.id, requestId));
  await logEvent(requestId, "voided", { detail: reason });
  for (const signer of await getSigners(requestId)) {
    if (signer.status === "waiting") continue;
    await sendVoidedNotice({ to: signer.email, name: signer.name, title: request.title, reason: reason?.trim() || null }).catch(() => {});
  }
}

// ── Signer actions (public, token-based) ─────────────────────────────────────

export type SessionState = "ready" | "waiting" | "signed" | "completed" | "declined" | "voided";

function stateFor(request: SignatureRequest, signer: SignatureSigner): SessionState {
  if (request.status === "voided") return "voided";
  if (request.status === "completed") return "completed";
  if (signer.status === "signed") return "signed";
  if (signer.status === "declined" || request.status === "declined") return "declined";
  if (signer.status === "waiting") return "waiting";
  return "ready";
}

export async function findSession(token: string) {
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(token)) return null;
  const db = await requireDb();
  const [signer] = await db.select().from(signatureSigners).where(eq(signatureSigners.token, token)).limit(1);
  if (!signer) return null;
  const request = await getRequest(signer.requestId);
  return { signer, request, state: stateFor(request, signer) };
}

async function requireSession(token: string) {
  const session = await findSession(token);
  if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "This signing link isn't valid." });
  return session;
}

export async function publicSession(token: string) {
  const { signer, request, state } = await requireSession(token);
  const signers = await getSigners(request.id);
  return {
    state,
    title: request.title,
    kind: request.kind,
    message: request.message,
    senderName: request.createdByName || "Luxe Property Solutions",
    pageCount: request.sourcePageCount,
    signer: { name: signer.name, email: signer.email, roleLabel: signer.roleLabel, status: signer.status, declinedByMe: signer.status === "declined" },
    signers: signers.map((s) => ({ name: s.name, roleLabel: s.roleLabel, status: s.status, isMe: s.id === signer.id })),
  };
}

export async function markViewed(token: string, audit: Audit) {
  const { signer, request, state } = await requireSession(token);
  if (state !== "ready" || signer.viewedAt) return;
  const db = await requireDb();
  await db.update(signatureSigners).set({ status: "viewed", viewedAt: new Date() }).where(eq(signatureSigners.id, signer.id));
  await logEvent(request.id, "viewed", { signerId: signer.id, audit });
}

export async function submitSignature(
  token: string,
  input: { consent: boolean; printedName: string; method: "typed" | "drawn"; signatureImage: string },
  audit: Audit
) {
  const { signer, request, state } = await requireSession(token);
  if (state !== "ready") throw new TRPCError({ code: "BAD_REQUEST", message: "This document can't be signed anymore." });
  if (!input.consent) throw new TRPCError({ code: "BAD_REQUEST", message: "Please agree to sign electronically." });
  try {
    await validateSignaturePng(input.signatureImage);
  } catch (err: any) {
    throw new TRPCError({ code: "BAD_REQUEST", message: err.message });
  }

  const db = await requireDb();
  const now = new Date();
  const result = await db
    .update(signatureSigners)
    .set({
      status: "signed",
      consentedAt: now,
      signedAt: now,
      printedName: input.printedName.trim(),
      signatureMethod: input.method,
      signatureImage: input.signatureImage,
      signedIp: audit.ip?.slice(0, 64) ?? null,
      signedUserAgent: audit.userAgent?.slice(0, 500) ?? null,
    })
    .where(and(eq(signatureSigners.id, signer.id), inArray(signatureSigners.status, ["sent", "viewed"])));
  if (affectedRows(result) === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "This document was already signed." });

  await logEvent(request.id, "consented", { signerId: signer.id, audit });
  await logEvent(request.id, "signed", { signerId: signer.id, audit, detail: input.method });

  const signers = await getSigners(request.id);
  if (signers.every((s) => s.status === "signed")) await finalizeRequest(request.id);
  else await sendNextSigners(request.id);

  return publicSession(token);
}

export async function declineSignature(token: string, reason: string, audit: Audit) {
  const { signer, request, state } = await requireSession(token);
  if (state !== "ready") throw new TRPCError({ code: "BAD_REQUEST", message: "This document can't be declined anymore." });
  const db = await requireDb();
  const now = new Date();
  await db
    .update(signatureSigners)
    .set({ status: "declined", declinedAt: now, declineReason: reason.trim() || null })
    .where(eq(signatureSigners.id, signer.id));
  await db.update(signatureRequests).set({ status: "declined", updatedAt: now }).where(eq(signatureRequests.id, request.id));
  await logEvent(request.id, "declined", { signerId: signer.id, audit, detail: reason });
  await sendDeclinedNotice({ title: request.title, signerName: signer.name, signerEmail: signer.email, reason: reason.trim() || null }).catch(() => {});
  return publicSession(token);
}

// ── Completion ───────────────────────────────────────────────────────────────

const DOC_TYPE_FOR: Record<Category, "lease" | "management_agreement" | "lien_waiver" | "w9" | "other"> = {
  lease: "lease",
  management_agreement: "management_agreement",
  lien_waiver: "lien_waiver",
  w9: "w9",
  other: "other",
};

/**
 * Builds the signed PDF, files it in Nextcloud, shares it into the linked portal and emails everyone.
 * Failures leave the request in "error" so an admin can retry.
 */
export async function finalizeRequest(requestId: string) {
  const db = await requireDb();
  const lock = await db
    .update(signatureRequests)
    .set({ status: "processing", updatedAt: new Date() })
    .where(and(eq(signatureRequests.id, requestId), inArray(signatureRequests.status, ["sent", "error"])));
  if (affectedRows(lock) === 0) return; // already finalizing or finished

  try {
    const request = await getRequest(requestId);
    const signers = await getSigners(requestId);
    if (!request.sourceFileId) throw new Error("This request has no source document.");
    const source = await nc.downloadByFileId(request.sourceFileId);
    if (sha256(source) !== request.sourceSha256) {
      throw new Error("The original PDF in Nextcloud was changed after it was sent, so it can't be finalized. Cancel and send it again.");
    }

    const completedAt = new Date();
    const finalBytes = await buildSignedPdf({ source, request, signers, events: await getEvents(requestId), completedAt });
    const finalSha256 = sha256(finalBytes);
    const fileName = `${nc.safeName(request.title)} - Signed ${today()}.pdf`;
    const uploaded = await nc.uploadFile(nc.joinPath(request.folderPath, fileName), finalBytes, "application/pdf");

    const documentId =
      request.tenantId || request.ownerUserId || request.propertyId
        ? await createDocumentRecord({
            name: nc.baseName(uploaded.path),
            type: DOC_TYPE_FOR[request.category],
            nextcloudPath: uploaded.path,
            nextcloudFileId: uploaded.fileId,
            mimeType: "application/pdf",
            sizeBytes: finalBytes.byteLength,
            tenantId: request.tenantId,
            ownerUserId: request.ownerUserId,
            propertyId: request.propertyId,
            signatureRequestId: request.id,
            uploadedBy: request.createdBy,
          })
        : null;

    await db
      .update(signatureRequests)
      .set({
        status: "completed",
        completedAt,
        finalPath: uploaded.path,
        finalFileId: uploaded.fileId,
        finalSha256,
        documentId,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(signatureRequests.id, requestId));
    await logEvent(requestId, "completed", { detail: finalSha256 });

    const attachment =
      finalBytes.byteLength <= MAX_ATTACHMENT_BYTES
        ? { fileName: nc.baseName(uploaded.path), contentType: "application/pdf", content: finalBytes }
        : null;
    const signerEmails = new Set(signers.map((s) => s.email.toLowerCase()));
    for (const signer of signers) {
      await sendCompletedCopy({
        to: signer.email,
        name: signer.printedName || signer.name,
        title: request.title,
        finalSha256,
        attachment,
        link: signingUrl(signer.token),
      }).catch((err) => logEvent(requestId, "email_failed", { signerId: signer.id, detail: `Completed copy: ${err?.message}` }));
    }
    if (!signerEmails.has(adminRecipient().toLowerCase())) {
      await sendCompletedCopy({
        to: adminRecipient(),
        name: "Luxe Property Solutions",
        title: request.title,
        finalSha256,
        attachment,
        link: `${siteUrl()}/admin/esign`,
      }).catch(() => {});
    }
  } catch (err: any) {
    console.error("[E-Sign] Finalize failed for", requestId, err);
    await db
      .update(signatureRequests)
      .set({ status: "error", errorMessage: String(err?.message ?? err).slice(0, 1000), updatedAt: new Date() })
      .where(eq(signatureRequests.id, requestId));
    await logEvent(requestId, "finalize_failed", { detail: err?.message });
  }
}
