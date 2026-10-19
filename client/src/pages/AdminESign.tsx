import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Archive,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  FileSignature,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PartyPicker, { NO_PARTY, partyIds, useParties, type PartySelection } from "@/components/PartyPicker";
import { trpc } from "@/lib/trpc";
import { adminFileUrl, uploadToNextcloud } from "@/lib/nextcloudUpload";
import PdfViewer from "@/components/PdfViewer";
import { SIGNATURE_CATEGORY_LABELS, type SignatureCategory } from "@shared/documents";

type SendCategory = Exclude<SignatureCategory, "w9">;
type TemplateCategory = "lease" | "management_agreement" | "lien_waiver" | "other";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";
const labelCls = "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5";

const DEFAULT_ROLES: Record<TemplateCategory, string[]> = {
  lease: ["Tenant", "Luxe Property Solutions"],
  management_agreement: ["Owner", "Luxe Property Solutions"],
  lien_waiver: ["Contractor / Vendor"],
  other: ["Signer"],
};

const REQUEST_STATUS: Record<string, { label: string; cls: string }> = {
  sent: { label: "Out for signature", cls: "bg-blue-100 text-blue-700" },
  processing: { label: "Finishing…", cls: "bg-amber-100 text-amber-800" },
  completed: { label: "Completed", cls: "bg-green-100 text-green-700" },
  declined: { label: "Declined", cls: "bg-red-100 text-red-700" },
  voided: { label: "Cancelled", cls: "bg-gray-200 text-gray-600" },
  error: { label: "Needs attention", cls: "bg-red-100 text-red-700" },
};

const SIGNER_STATUS: Record<string, { label: string; cls: string }> = {
  waiting: { label: "Up next", cls: "text-gray-400" },
  sent: { label: "Awaiting signature", cls: "text-blue-600" },
  viewed: { label: "Opened", cls: "text-amber-600" },
  signed: { label: "Signed", cls: "text-green-600" },
  declined: { label: "Declined", cls: "text-red-600" },
};

const EVENT_TEXT: Record<string, string> = {
  created: "Request created",
  sent: "Signing link emailed",
  email_failed: "Email failed",
  link_copied: "Signing link copied",
  viewed: "Opened the document",
  consented: "Agreed to e-sign",
  signed: "Signed",
  declined: "Declined",
  reminder_sent: "Reminder emailed",
  voided: "Cancelled",
  completed: "Completed — signed copy filed and emailed",
  finalize_failed: "Finishing failed",
};

function fmt(value: Date | string | null | undefined) {
  return value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";
}

function Modal({ title, subtitle, onClose, wide, children }: { title: string; subtitle?: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Signing link copied");
  } catch {
    window.prompt("Copy this signing link:", text);
  }
}

// ── Word template details ─────────────────────────────────────────────────────
type FieldValues = Record<string, string>;

function base64ToBlobUrl(base64: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}

function TemplateFields({
  templateId,
  party,
  values,
  onChange,
}: {
  templateId: string;
  party: PartySelection;
  values: FieldValues;
  onChange: (update: (prev: FieldValues) => FieldValues) => void;
}) {
  const { properties, propertyLabel } = useParties();
  const [contextProperty, setContextProperty] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const edited = useRef(new Set<string>());
  const ready = party.kind === "none" || !!party.id;
  const fields = trpc.esign.templateFields.useQuery(
    { templateId, ...partyIds(party), ...(contextProperty ? { propertyId: contextProperty } : {}) },
    { enabled: ready }
  );
  const preview = trpc.esign.previewTemplate.useMutation({
    onSuccess: (r) => setPreviewUrl(base64ToBlobUrl(r.pdfBase64)),
    onError: (e) => toast.error(e.message),
  });

  // Fill in what the site knows, without overwriting anything typed by hand.
  useEffect(() => {
    if (!fields.data) return;
    onChange((prev) => {
      const next = { ...prev };
      for (const f of fields.data) if (!edited.current.has(f.key)) next[f.key] = f.value;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.data]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const showPropertyPicker = party.kind === "none" || party.kind === "owner";

  return (
    <div className="border border-[#C9A84C]/40 bg-[#C9A84C]/5 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#0A1628]">Fill in the details</p>
          <p className="text-xs text-gray-500">Highlighted fields came from the site. Change anything that's wrong.</p>
        </div>
        <button
          type="button"
          onClick={() => preview.mutate({ templateId, values })}
          disabled={preview.isPending || !fields.data}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 shrink-0"
        >
          {preview.isPending ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Preview
        </button>
      </div>
      {showPropertyPicker && (
        <div>
          <label className={labelCls}>Use property details from</label>
          <select className={inputCls} value={contextProperty} onChange={(e) => setContextProperty(e.target.value)}>
            <option value="">{party.kind === "owner" ? "— The owner's property (if they have just one) —" : "— No property —"}</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {propertyLabel(p)}
              </option>
            ))}
          </select>
        </div>
      )}
      {!ready ? (
        <p className="text-sm text-gray-500">Choose who it's for above to fill in their details.</p>
      ) : fields.isLoading ? (
        <p className="text-sm text-gray-400">Loading details…</p>
      ) : fields.error ? (
        <p className="text-sm text-red-600">{fields.error.message}</p>
      ) : !fields.data?.length ? (
        <p className="text-sm text-gray-500">This template has no {"{{placeholders}}"}.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {fields.data.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {f.label} <span className="font-mono text-[10px] text-gray-400">{"{{" + f.key + "}}"}</span>
              </label>
              <input
                className={
                  f.known && f.value && values[f.key] === f.value
                    ? inputCls.replace("bg-white", "bg-[#C9A84C]/10").replace("border-gray-300", "border-[#C9A84C]/60")
                    : inputCls
                }
                value={values[f.key] ?? ""}
                onChange={(e) => {
                  edited.current.add(f.key);
                  const v = e.target.value;
                  onChange((prev) => ({ ...prev, [f.key]: v }));
                }}
              />
            </div>
          ))}
        </div>
      )}
      {previewUrl && (
        <Modal title="Preview" subtitle="This is exactly what signers will see" onClose={() => setPreviewUrl(null)} wide>
          <div className="max-h-[70vh] overflow-y-auto bg-gray-200/60 p-3 rounded-lg">
            <PdfViewer url={previewUrl} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── New signature request ─────────────────────────────────────────────────────
type SignerRow = { name: string; email: string; roleLabel: string };
type Prefill = { fileId: string; name: string } | null;

function NewRequestModal({ prefill, onClose, onSent }: { prefill: Prefill; onClose: () => void; onSent: () => void }) {
  const templates = trpc.esign.templates.useQuery();
  const me = trpc.auth.me.useQuery();
  const { tenants, owners } = useParties();
  const create = trpc.esign.create.useMutation();

  const [sourceKind, setSourceKind] = useState<"template" | "upload" | "file">(prefill ? "file" : "template");
  const [templateId, setTemplateId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(prefill ? prefill.name.replace(/\.pdf$/i, "") : "");
  const [category, setCategory] = useState<SendCategory>("lease");
  const [party, setParty] = useState<PartySelection>(NO_PARTY);
  const [signers, setSigners] = useState<SignerRow[]>([{ name: "", email: "", roleLabel: "" }]);
  const [sequential, setSequential] = useState(true);
  const [message, setMessage] = useState("");
  const [fieldValues, setFieldValues] = useState<FieldValues>({});
  const [blankConfirmed, setBlankConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTemplates = templates.data ?? [];
  const selectedTemplate = activeTemplates.find((t) => t.id === templateId);
  const usesFields = sourceKind === "template" && selectedTemplate?.format === "docx";

  function applyTemplate(id: string) {
    setTemplateId(id);
    setFieldValues({});
    setBlankConfirmed(false);
    const t = activeTemplates.find((x) => x.id === id);
    if (!t) return;
    setTitle((prev) => prev || t.name);
    setCategory(t.category as SendCategory);
    const roles = (t.signerRoles as string[] | null)?.length ? (t.signerRoles as string[]) : DEFAULT_ROLES[t.category as TemplateCategory];
    setSigners((prev) => {
      const filled = prev.filter((s) => s.name || s.email);
      if (filled.length) return prev;
      return roles.map((roleLabel) => ({ name: "", email: "", roleLabel }));
    });
  }

  const partyContact = useMemo(() => {
    if (party.kind === "tenant") {
      const t = tenants.find((x) => x.id === party.id);
      return t ? { name: t.name || "", email: t.email || "", roleLabel: "Tenant" } : null;
    }
    if (party.kind === "owner") {
      const o = owners.find((x) => x.id === party.id);
      return o ? { name: o.name || "", email: o.email || "", roleLabel: "Owner" } : null;
    }
    return null;
  }, [party, tenants, owners]);

  function addSigner(row: SignerRow) {
    setSigners((prev) => {
      const emptyIndex = prev.findIndex((s) => !s.name && !s.email);
      if (emptyIndex === -1) return [...prev, row];
      const next = [...prev];
      next[emptyIndex] = { ...row, roleLabel: row.roleLabel || next[emptyIndex].roleLabel };
      return next;
    });
  }

  function updateSigner(index: number, patch: Partial<SignerRow>) {
    setSigners((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function send() {
    setError(null);
    const cleanSigners = signers.filter((s) => s.name.trim() || s.email.trim());
    if (!title.trim()) return setError("Give the document a title.");
    if (sourceKind === "template" && !templateId) return setError("Choose a template.");
    if (sourceKind === "upload" && !file) return setError("Choose a PDF to upload.");
    if (sourceKind === "upload" && file && !/\.pdf$/i.test(file.name) && file.type !== "application/pdf") return setError("Only PDF files can be sent for signature.");
    if (!cleanSigners.length) return setError("Add at least one signer.");
    if (cleanSigners.some((s) => !s.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim()))) {
      return setError("Every signer needs a name and a valid email.");
    }
    if (party.kind !== "none" && !party.id) return setError(`Select which ${party.kind} this is for, or choose "Nobody".`);
    if (usesFields && !blankConfirmed) {
      const blanks = ((selectedTemplate?.fields as string[] | null) ?? []).filter((k) => !fieldValues[k]?.trim());
      if (blanks.length) {
        setBlankConfirmed(true);
        const one = blanks.length === 1;
        return setError(
          `${blanks.length} detail${one ? " is" : "s are"} blank (${blanks.join(", ")}). Fill ${one ? "it" : "them"} in, or click Send again to leave ${one ? "it" : "them"} blank.`
        );
      }
    }

    setBusy(true);
    try {
      let source: { kind: "template"; templateId: string } | { kind: "file"; fileId: string } | { kind: "upload"; fileId: string; path: string };
      if (sourceKind === "template") source = { kind: "template", templateId };
      else if (sourceKind === "file" && prefill) source = { kind: "file", fileId: prefill.fileId };
      else {
        const stamp = new Date().toISOString().slice(0, 10);
        const uploaded = await uploadToNextcloud(file!, "/E-Sign Originals", `${stamp} ${title.trim()}.pdf`);
        source = { kind: "upload", fileId: uploaded.fileId, path: uploaded.path };
      }
      const result = await create.mutateAsync({
        title: title.trim(),
        category,
        source,
        signers: cleanSigners.map((s) => ({ name: s.name.trim(), email: s.email.trim(), roleLabel: s.roleLabel.trim() || undefined })),
        sequential,
        message: message.trim() || undefined,
        ...partyIds(party),
        ...(usesFields ? { fieldValues } : {}),
      });
      if (result.emailed === result.invited) {
        toast.success(sequential ? `Sent to ${cleanSigners[0].name}` : `Sent to ${cleanSigners.length} signer${cleanSigners.length === 1 ? "" : "s"}`);
      } else {
        toast.warning("Request created, but the signing email couldn't be sent. Use “Copy link” to send it yourself.", { duration: 10000 });
      }
      onSent();
    } catch (err: any) {
      setError(err.message || "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  const sourceTab = (kind: typeof sourceKind, label: string) => (
    <button
      type="button"
      onClick={() => setSourceKind(kind)}
      className={`flex-1 py-2 text-sm font-semibold rounded-md ${sourceKind === kind ? "bg-white shadow text-[#0A1628]" : "text-gray-500"}`}
    >
      {label}
    </button>
  );

  return (
    <Modal title="Send for Signature" subtitle="Signers get a secure link by email and sign on luxestl.com" onClose={busy ? () => {} : onClose} wide>
      <div>
        <label className={labelCls}>Document</label>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-3">
          {sourceTab("template", "From a template")}
          {sourceTab("upload", "Upload a PDF")}
          {prefill && sourceTab("file", "From Documents")}
        </div>
        {sourceKind === "template" &&
          (templates.isLoading ? (
            <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">Loading templates…</p>
          ) : activeTemplates.length ? (
            <select className={inputCls} value={templateId} onChange={(e) => applyTemplate(e.target.value)}>
              <option value="">— Choose a template —</option>
              {activeTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {SIGNATURE_CATEGORY_LABELS[t.category as SendCategory]}{t.format === "docx" ? " · fills in details" : ""}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">No templates yet. Add them on the Templates tab, or upload a PDF instead.</p>
          ))}
        {sourceKind === "upload" && (
          <input type="file" accept="application/pdf,.pdf" onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            if (f && !title) setTitle(f.name.replace(/\.pdf$/i, ""));
          }} className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#0A1628] file:text-white file:text-sm file:font-semibold" />
        )}
        {sourceKind === "file" && prefill && (
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 inline-flex items-center gap-2">
            <FileText size={16} className="text-gray-400" /> {prefill.name}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lease — 123 Main St, Unit 2" />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as SendCategory)}>
            {(["lease", "management_agreement", "lien_waiver", "other"] as SendCategory[]).map((c) => (
              <option key={c} value={c}>
                {SIGNATURE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Who is it for? (files the signed copy and shows it in their portal)</label>
        <PartyPicker value={party} onChange={setParty} noneLabel="Nobody in the system" />
      </div>

      {usesFields && <TemplateFields key={templateId} templateId={templateId} party={party} values={fieldValues} onChange={setFieldValues} />}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls + " mb-0"}>Signers</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={sequential} onChange={(e) => setSequential(e.target.checked)} />
            Sign in this order
          </label>
        </div>
        <div className="space-y-2">
          {signers.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-1 text-sm font-bold text-gray-400 text-center">{sequential ? i + 1 : "•"}</span>
              <input className={inputCls + " col-span-4"} placeholder="Full name" value={s.name} onChange={(e) => updateSigner(i, { name: e.target.value })} />
              <input className={inputCls + " col-span-4"} placeholder="Email" type="email" value={s.email} onChange={(e) => updateSigner(i, { email: e.target.value })} />
              <input className={inputCls + " col-span-2"} placeholder="Role" value={s.roleLabel} onChange={(e) => updateSigner(i, { roleLabel: e.target.value })} />
              <button
                type="button"
                onClick={() => setSigners((prev) => (prev.length === 1 ? [{ name: "", email: "", roleLabel: "" }] : prev.filter((_, j) => j !== i)))}
                className="col-span-1 text-gray-400 hover:text-red-600 flex justify-center"
                aria-label="Remove signer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button type="button" onClick={() => setSigners((prev) => [...prev, { name: "", email: "", roleLabel: "" }])} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50">
            <Plus size={14} /> Add signer
          </button>
          {partyContact?.email && (
            <button type="button" onClick={() => addSigner(partyContact)} className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#C9A84C] rounded-lg text-xs font-semibold text-[#8a6d1f] hover:bg-[#C9A84C]/10">
              <Plus size={14} /> Add {partyContact.name || partyContact.email}
            </button>
          )}
          {me.data?.email && (
            <button
              type="button"
              onClick={() => addSigner({ name: me.data!.name || "Luxe Property Solutions", email: me.data!.email!, roleLabel: "Luxe Property Solutions" })}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Plus size={14} /> Add me
            </button>
          )}
        </div>
      </div>

      <div>
        <label className={labelCls}>Message to signers (optional)</label>
        <textarea className={inputCls} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi! Here's your lease for review. Let me know if you have any questions." />
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="flex gap-3 pt-1">
        <button onClick={onClose} disabled={busy} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          Cancel
        </button>
        <button onClick={send} disabled={busy} className="flex-1 py-2.5 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white rounded-lg text-sm font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {busy ? "Sending…" : "Send for signature"}
        </button>
      </div>
    </Modal>
  );
}

// ── Cancel (void) a request ───────────────────────────────────────────────────
function VoidModal({ request, onClose, onDone }: { request: any; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const voidRequest = trpc.esign.void.useMutation({
    onSuccess: () => {
      toast.success("Request cancelled");
      onDone();
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Modal title="Cancel this request?" subtitle={request.title} onClose={onClose}>
      <p className="text-sm text-gray-600">Signing links stop working, and anyone who already received the request is emailed that it was cancelled.</p>
      <div>
        <label className={labelCls}>Reason (optional, included in the email)</label>
        <textarea className={inputCls} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
          Keep it
        </button>
        <button
          onClick={() => voidRequest.mutate({ requestId: request.id, reason: reason.trim() || undefined })}
          disabled={voidRequest.isPending}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold disabled:opacity-50"
        >
          {voidRequest.isPending ? "Cancelling…" : "Cancel request"}
        </button>
      </div>
    </Modal>
  );
}

// ── Request card ──────────────────────────────────────────────────────────────
function RequestCard({ request, onChanged }: { request: any; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirmVoid, setConfirmVoid] = useState(false);
  const events = trpc.esign.events.useQuery({ requestId: request.id }, { enabled: open });
  const signingLink = trpc.esign.signingLink.useMutation();
  const remind = trpc.esign.remind.useMutation({
    onSuccess: (r) => {
      toast.success(r.sent ? `Reminder sent to ${r.sent} signer${r.sent === 1 ? "" : "s"}` : "Reminder couldn't be emailed — copy the link instead");
      onChanged();
    },
    onError: (e) => toast.error(e.message),
  });
  const retry = trpc.esign.retry.useMutation({ onSuccess: onChanged, onError: (e) => toast.error(e.message) });

  const status = REQUEST_STATUS[request.status] ?? REQUEST_STATUS.sent;
  const isOpen = request.status === "sent";
  const signerNames = new Map<string, string>(request.signers.map((s: any) => [s.id, s.name]));

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[#0A1628] truncate">{request.title}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {SIGNATURE_CATEGORY_LABELS[request.category as SignatureCategory]} · Sent {fmt(request.createdAt)}
              {request.createdByName ? ` by ${request.createdByName}` : ""}
              {request.completedAt ? ` · Completed ${fmt(request.completedAt)}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {request.status === "completed" && (
              <a href={`/api/esign/requests/${request.id}/final`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1628] text-white rounded-lg text-xs font-bold hover:bg-[#0A1628]/90">
                <Download size={14} /> Signed copy
              </a>
            )}
            {isOpen && (
              <button onClick={() => remind.mutate({ requestId: request.id })} disabled={remind.isPending} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                <Bell size={14} /> Remind
              </button>
            )}
            {request.status === "error" && (
              <button onClick={() => retry.mutate({ requestId: request.id })} disabled={retry.isPending} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-amber-400 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50">
                <RotateCcw size={14} /> {retry.isPending ? "Retrying…" : "Retry"}
              </button>
            )}
            {["sent", "declined", "error"].includes(request.status) && (
              <button
                onClick={() => setConfirmVoid(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <XCircle size={14} /> Cancel
              </button>
            )}
          </div>
        </div>

        {request.status === "error" && request.errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {request.errorMessage}
          </div>
        )}

        <ul className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-lg">
          {request.signers.map((s: any) => {
            const st = SIGNER_STATUS[s.status] ?? SIGNER_STATUS.waiting;
            const canCopy = isOpen && (s.status === "sent" || s.status === "viewed");
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-gray-400"> · {s.email}{s.roleLabel ? ` · ${s.roleLabel}` : ""}</span>
                  {s.declineReason && <p className="text-xs text-red-600 mt-0.5">“{s.declineReason}”</p>}
                </div>
                <div className="flex items-center gap-3">
                  {canCopy && s.emailFailed && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600" title="The signing email couldn't be sent — copy the link and send it yourself">
                      <AlertTriangle size={12} /> Email failed
                    </span>
                  )}
                  <span className={`text-xs font-semibold ${st.cls}`}>
                    {st.label}
                    {s.signedAt ? ` ${fmt(s.signedAt)}` : s.viewedAt && s.status === "viewed" ? ` ${fmt(s.viewedAt)}` : ""}
                  </span>
                  {canCopy && (
                    <button
                      onClick={async () => copyText((await signingLink.mutateAsync({ signerId: s.id })).url)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#8a6d1f] hover:underline"
                    >
                      <Copy size={12} /> Copy link
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
          <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1 font-semibold text-gray-600 hover:text-[#0A1628]">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Audit trail
          </button>
          <a href={`/api/esign/requests/${request.id}/source`} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-600 hover:text-[#0A1628]">
            View original
          </a>
          {request.finalPath && <span className="text-gray-400 truncate">Filed in Nextcloud: {request.finalPath}</span>}
        </div>

        {open && (
          <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs space-y-1.5">
            {events.isLoading ? (
              <span className="text-gray-400">Loading…</span>
            ) : (
              (events.data ?? []).map((e) => (
                <div key={e.id} className="flex flex-wrap gap-x-2">
                  <span className="text-gray-400 w-40 shrink-0">{fmt(e.createdAt)}</span>
                  <span className="text-gray-700">
                    {e.signerId ? `${signerNames.get(e.signerId) ?? "Signer"}: ` : ""}
                    {EVENT_TEXT[e.event] ?? e.event}
                    {e.ip ? ` · IP ${e.ip}` : ""}
                    {e.event === "email_failed" && e.detail ? ` — ${e.detail}` : ""}
                  </span>
                </div>
              ))
            )}
            {request.finalSha256 && <p className="pt-2 text-gray-500 break-all">Signed file SHA-256: {request.finalSha256}</p>}
          </div>
        )}
      </div>
      {confirmVoid && (
        <VoidModal
          request={request}
          onClose={() => setConfirmVoid(false)}
          onDone={() => {
            setConfirmVoid(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

// ── Templates ─────────────────────────────────────────────────────────────────
function TemplateModal({ template, onClose, onSaved }: { template: any | null; onClose: () => void; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState(template?.name ?? "");
  const [category, setCategory] = useState<TemplateCategory>(template?.category ?? "lease");
  const [roles, setRoles] = useState<string>(((template?.signerRoles as string[]) ?? DEFAULT_ROLES.lease).join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = trpc.esign.createTemplate.useMutation();
  const update = trpc.esign.updateTemplate.useMutation();

  async function save() {
    setError(null);
    if (!name.trim()) return setError("Give the template a name.");
    if (!template && !file) return setError("Choose a Word (.docx) or PDF file.");
    if (!template && file && !/\.(pdf|docx)$/i.test(file.name)) return setError("Templates must be Word (.docx) or PDF files.");
    const signerRoles = roles.split(",").map((r) => r.trim()).filter(Boolean);
    setBusy(true);
    try {
      if (template) {
        await update.mutateAsync({ id: template.id, name: name.trim(), category, signerRoles });
      } else {
        const ext = /\.docx$/i.test(file!.name) ? "docx" : "pdf";
        const uploaded = await uploadToNextcloud(file!, "/Templates", `${name.trim()}.${ext}`);
        const result = await create.mutateAsync({ fileId: uploaded.fileId, path: uploaded.path, name: name.trim(), category, signerRoles });
        if (result.warning) toast.warning(`Template saved, but: ${result.warning}`, { duration: 12000 });
        else if (result.fields) toast.success(`Template saved with ${result.fields.length} fill-in${result.fields.length === 1 ? "" : "s"}`);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || "Could not save the template.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={template ? "Edit Template" : "Add Template"} subtitle={template ? undefined : "Stored in Nextcloud under Templates"} onClose={busy ? () => {} : onClose}>
      {!template && (
        <div>
          <label className={labelCls}>Word (.docx) or PDF</label>
          <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            if (f && !name) setName(f.name.replace(/\.(pdf|docx)$/i, ""));
          }} className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#0A1628] file:text-white file:text-sm file:font-semibold" />
          <p className="text-xs text-gray-500 mt-1.5">Use Word with {"{{placeholders}}"} to fill in details each time (see the guide on the Templates tab). PDFs are sent exactly as they are.</p>
        </div>
      )}
      <div>
        <label className={labelCls}>Name</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Residential Lease (12-month)" />
      </div>
      <div>
        <label className={labelCls}>Type</label>
        <select
          className={inputCls}
          value={category}
          onChange={(e) => {
            const c = e.target.value as TemplateCategory;
            setCategory(c);
            if (!template) setRoles(DEFAULT_ROLES[c].join(", "));
          }}
        >
          {(["lease", "management_agreement", "lien_waiver", "other"] as TemplateCategory[]).map((c) => (
            <option key={c} value={c}>
              {SIGNATURE_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Default signer roles (comma-separated, in signing order)</label>
        <input className={inputCls} value={roles} onChange={(e) => setRoles(e.target.value)} />
      </div>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      <button onClick={save} disabled={busy} className="w-full py-2.5 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white rounded-lg text-sm font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {busy ? "Saving…" : "Save template"}
      </button>
    </Modal>
  );
}

function PlaceholderGuide() {
  const fields = trpc.esign.standardFields.useQuery();
  const [open, setOpen] = useState(false);

  async function copy(tag: string) {
    try {
      await navigator.clipboard.writeText(tag);
      toast.success(`Copied ${tag}`);
    } catch {
      window.prompt("Copy this placeholder:", tag);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-semibold text-[#0A1628]">How to make a Word template that fills itself in</span>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 text-sm text-gray-700">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>Open your lease or agreement in Word.</li>
            <li>
              Wherever a detail changes each time, type a placeholder with two curly braces on each side, e.g. <code className="bg-gray-100 px-1 rounded">{"{{tenant_name}}"}</code>. Format it however you like (bold, underline) — the formatting is kept.
            </li>
            <li>
              Need something the site doesn't track, like a deposit or pet fee? Make up a name in lowercase with underscores, e.g. <code className="bg-gray-100 px-1 rounded">{"{{security_deposit}}"}</code>. You'll type the value when you send.
            </li>
            <li>You don't need signature lines — a signature page is added automatically. Save as .docx and upload it here.</li>
          </ol>
          <div>
            <p className="font-semibold text-[#0A1628] mb-2">Placeholders the site fills in for you (click to copy)</p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {(fields.data ?? []).map((f) => {
                const tag = `{{${f.key}}}`;
                return (
                  <button key={f.key} onClick={() => copy(tag)} className="flex items-baseline justify-between gap-3 text-left py-1 border-b border-gray-100 hover:bg-gray-50">
                    <code className="text-[#8a6d1f] text-xs">{tag}</code>
                    <span className="text-xs text-gray-500 text-right">{f.source}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplatesTab() {
  const utils = trpc.useUtils();
  const templates = trpc.esign.templates.useQuery();
  const [editing, setEditing] = useState<any | "new" | null>(null);
  const archive = trpc.esign.updateTemplate.useMutation({ onSuccess: () => utils.esign.templates.invalidate() });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <p className="text-sm text-gray-600">Word templates fill in tenant, owner and property details every time you send. PDFs are sent as-is.</p>
        <button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 shrink-0">
          <Upload size={16} /> Add Template
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {templates.isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : !templates.data?.length ? (
          <div className="p-10 text-center text-gray-500 text-sm">No templates yet. Add {"{{placeholders}}"} to your Word lease or management agreement (guide below), then upload it.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Format</th>
                <th className="px-4 py-3 font-semibold">Pages</th>
                <th className="px-4 py-3 font-semibold">Signer roles</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {templates.data.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-medium text-[#0A1628]">{t.name}</td>
                  <td className="px-4 py-3 text-gray-600">{SIGNATURE_CATEGORY_LABELS[t.category as SendCategory]}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.format === "docx" ? (
                      <span title={((t.fields as string[]) ?? []).map((f) => "{{" + f + "}}").join("  ")}>
                        Word · {((t.fields as string[]) ?? []).length} fill-ins
                      </span>
                    ) : (
                      "PDF"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.pageCount ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{((t.signerRoles as string[]) ?? []).join(" → ") || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <a href={adminFileUrl(t.nextcloudFileId, `${t.name}.${t.format === "docx" ? "docx" : "pdf"}`)} target="_blank" rel="noopener noreferrer" title="Open" className="p-2 rounded hover:bg-gray-200 text-gray-600">
                        <Download size={16} />
                      </a>
                      <button onClick={() => setEditing(t)} title="Edit" className="p-2 rounded hover:bg-gray-200 text-gray-600">
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => window.confirm(`Archive "${t.name}"? Past requests are not affected.`) && archive.mutate({ id: t.id, active: false })}
                        title="Archive"
                        className="p-2 rounded hover:bg-gray-200 text-gray-600"
                      >
                        <Archive size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <PlaceholderGuide />
      {editing && (
        <TemplateModal
          template={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            utils.esign.templates.invalidate();
          }}
        />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminESign() {
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<"requests" | "templates">("requests");
  const [filter, setFilter] = useState<"open" | "completed" | "all">("open");
  const [newRequest, setNewRequest] = useState<{ prefill: Prefill } | null>(null);
  const requests = trpc.esign.requests.useQuery(undefined, { refetchInterval: 30_000 });

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const fileId = q.get("fileId");
    if (fileId && /^\d+$/.test(fileId)) {
      setNewRequest({ prefill: { fileId, name: q.get("name") ?? "Document.pdf" } });
      window.history.replaceState(null, "", "/admin/esign");
    }
  }, []);

  const list = (requests.data ?? []).filter((r) =>
    filter === "all" ? true : filter === "completed" ? r.status === "completed" : !["completed", "voided"].includes(r.status)
  );
  const openCount = (requests.data ?? []).filter((r) => !["completed", "voided"].includes(r.status)).length;
  const refresh = () => utils.esign.requests.invalidate();

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 bg-gray-200/70 p-1 rounded-lg">
            {(["requests", "templates"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-semibold rounded-md capitalize ${tab === t ? "bg-white shadow text-[#0A1628]" : "text-gray-600"}`}
              >
                {t === "requests" ? `Requests${openCount ? ` (${openCount} open)` : ""}` : "Templates"}
              </button>
            ))}
          </div>
          <button onClick={() => setNewRequest({ prefill: null })} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C9A84C] text-[#0A1628] rounded-lg text-sm font-bold hover:bg-[#C9A84C]/90">
            <FileSignature size={16} /> Send for Signature
          </button>
        </div>

        {tab === "templates" ? (
          <TemplatesTab />
        ) : (
          <>
            <div className="flex gap-2">
              {(["open", "completed", "all"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-sm border capitalize ${filter === f ? "bg-[#0A1628] border-[#0A1628] text-white" : "bg-white border-gray-300 text-gray-700"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            {requests.isLoading ? (
              <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
            ) : requests.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{requests.error.message}</div>
            ) : !list.length ? (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500 text-sm">
                {filter === "open" ? (
                  <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Nothing waiting on signatures.</span>
                ) : (
                  "No requests yet."
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {list.map((r) => (
                  <RequestCard key={r.id} request={r} onChanged={refresh} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {newRequest && (
        <NewRequestModal
          prefill={newRequest.prefill}
          onClose={() => setNewRequest(null)}
          onSent={() => {
            setNewRequest(null);
            setTab("requests");
            setFilter("open");
            refresh();
          }}
        />
      )}
    </AdminLayout>
  );
}
