import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import InspectModule from "docxtemplater/js/inspect-module.js";

// Word templates use {{placeholder_name}} tags; values are filled in, then Gotenberg
// (LibreOffice on the Nextcloud server) turns the result into a PDF.

const DELIMITERS = { start: "{{", end: "}}" };
const FIELD_NAME = /^[a-z][a-z0-9_]*$/;

function readableTemplateError(err: any): Error {
  const errors: any[] = err?.properties?.errors ?? [err];
  const details = errors
    .map((e) => e?.properties?.explanation ?? e?.message ?? "")
    .filter(Boolean)
    .slice(0, 5);
  return new Error(`The Word template has a placeholder problem — ${details.join("; ") || "check every {{ has a matching }}"}.`);
}

function load(docx: Uint8Array, modules: any[] = []) {
  let zip: PizZip;
  try {
    zip = new PizZip(docx);
  } catch {
    throw new Error("That file isn't a readable Word (.docx) document.");
  }
  try {
    return new Docxtemplater(zip, { delimiters: DELIMITERS, paragraphLoop: true, linebreaks: true, modules, nullGetter: () => "", errorLogging: false });
  } catch (err) {
    throw readableTemplateError(err);
  }
}

/** The one supported repeating section: {{#properties}}…{{/properties}} (one row per property). */
export const PROPERTY_LIST = "properties";

/**
 * Placeholder names in the order they first appear. A properties list is reported as
 * "properties" followed by "properties.<column>" for each placeholder inside it.
 */
export function extractFields(docx: Uint8Array): string[] {
  const inspect = new InspectModule();
  load(docx, [inspect]);
  const fields: string[] = [];
  for (const [rawName, inner] of Object.entries(inspect.getAllTags())) {
    const name = rawName.trim();
    const columns = Object.keys((inner as Record<string, unknown>) ?? {}).map((c) => c.trim());
    if (!columns.length) {
      fields.push(name);
      continue;
    }
    if (name !== PROPERTY_LIST) {
      throw new Error(`Only a {{#properties}}…{{/properties}} list is supported in templates (found {{#${name}}}).`);
    }
    fields.push(PROPERTY_LIST, ...columns.map((c) => `${PROPERTY_LIST}.${c}`));
  }
  const bad = fields.map((f) => f.replace(`${PROPERTY_LIST}.`, "")).filter((n) => !FIELD_NAME.test(n));
  if (bad.length) {
    throw new Error(
      `Placeholder names must be lowercase letters, numbers and underscores (like {{tenant_name}}). Fix: ${bad.map((b) => `{{${b}}}`).join(", ")}`
    );
  }
  return Array.from(new Set(fields));
}

/** Values are strings; the properties list travels as a JSON array of row objects. */
export function fillDocx(docx: Uint8Array, values: Record<string, string>): Buffer {
  const data: Record<string, unknown> = { ...values };
  if (PROPERTY_LIST in values) {
    try {
      const rows = JSON.parse(values[PROPERTY_LIST] || "[]");
      data[PROPERTY_LIST] = Array.isArray(rows) ? rows : [];
    } catch {
      data[PROPERTY_LIST] = [];
    }
  }
  const doc = load(docx);
  try {
    doc.render(data);
  } catch (err) {
    throw readableTemplateError(err);
  }
  return doc.toBuffer();
}

function converterConfig() {
  const url = process.env.GOTENBERG_URL?.replace(/\/+$/, "");
  const password = process.env.GOTENBERG_PASSWORD;
  if (!url || !password) {
    throw new Error("The Word-to-PDF converter isn't configured yet (GOTENBERG_URL / GOTENBERG_PASSWORD).");
  }
  const user = process.env.GOTENBERG_USER || "luxe";
  return { url, auth: "Basic " + Buffer.from(`${user}:${password}`).toString("base64") };
}

export async function docxToPdf(docx: Uint8Array): Promise<Uint8Array> {
  const { url, auth } = converterConfig();
  const form = new FormData();
  form.append("files", new Blob([docx as BlobPart]), "document.docx");
  let res: Response;
  try {
    res = await fetch(`${url}/forms/libreoffice/convert`, { method: "POST", headers: { Authorization: auth }, body: form });
  } catch {
    throw new Error("Couldn't reach the Word-to-PDF converter on the Nextcloud server.");
  }
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw new Error(`The Word-to-PDF converter failed (HTTP ${res.status})${detail ? `: ${detail}` : ""}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}
