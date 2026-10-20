import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ChevronDown, ChevronUp, Eye, Loader2, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import PdfViewer from "@/components/PdfViewer";
import { partyIds, useParties, type PartySelection } from "@/components/PartyPicker";
import {
  FIELD_GROUPS,
  displayDateToIso,
  fieldSpec,
  formatMoney,
  formatPercent,
  formatPhone,
  isDefaultable,
  isoToDisplayDate,
  leaseEndIso,
  ordinal,
  parseMoney,
  proratedRent,
  type FieldGroup,
  type FieldSpec,
} from "@shared/templateFields";

export type FieldValues = Record<string, string>;
type Field = { key: string; label: string; value: string; source: "site" | "default" | null };

const baseInput =
  "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";
const labelCls = "block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5";

function inputClass(state: "site" | "default" | "blank" | "filled") {
  if (state === "site") return `${baseInput} bg-[#C9A84C]/10 border-[#C9A84C]/60`;
  if (state === "default") return `${baseInput} bg-blue-50 border-blue-200`;
  if (state === "blank") return `${baseInput} bg-white border-amber-300`;
  return `${baseInput} bg-white border-gray-300`;
}

function Chip({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="px-2 py-0.5 rounded-full border border-gray-300 bg-white text-[11px] font-semibold text-gray-600 hover:border-[#C9A84C] hover:text-[#8a6d1f]">
      {children}
    </button>
  );
}

function Adorned({ prefix, suffix, children }: { prefix?: string; suffix?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">{prefix}</span>}
      {children}
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{suffix}</span>}
    </div>
  );
}

/** One input, chosen by the placeholder's name. Values are kept exactly as they'll print. */
function FieldInput({ field, spec, value, cls, onChange }: { field: Field; spec: FieldSpec; value: string; cls: string; onChange: (v: string) => void }) {
  const listId = spec.suggestions ? `dl-${field.key}` : undefined;
  const datalist = spec.suggestions && (
    <datalist id={listId}>
      {spec.suggestions.map((s) => (
        <option key={s} value={s} />
      ))}
    </datalist>
  );

  switch (spec.kind) {
    case "date": {
      const iso = displayDateToIso(value);
      return (
        <div className="space-y-1">
          <input type="date" className={cls} value={iso} onChange={(e) => onChange(isoToDisplayDate(e.target.value))} />
          {value && !iso && <p className="text-xs text-gray-500">Will print as “{value}”</p>}
          {spec.suggestions && (
            <div className="flex flex-wrap gap-1">
              {spec.suggestions.map((s) => (
                <Chip key={s} onClick={() => onChange(s)}>{s}</Chip>
              ))}
            </div>
          )}
        </div>
      );
    }
    case "money":
      return (
        <>
          <Adorned prefix={parseMoney(value) !== null || !value ? "$" : undefined}>
            <input
              className={`${cls} ${parseMoney(value) !== null || !value ? "pl-7" : ""}`}
              inputMode="decimal"
              list={listId}
              value={value.replace(/^\$/, "")}
              placeholder="0.00"
              onChange={(e) => onChange(e.target.value)}
              onBlur={(e) => onChange(formatMoney(e.target.value))}
            />
          </Adorned>
          {datalist}
        </>
      );
    case "percent":
      return (
        <Adorned suffix="%">
          <input
            className={`${cls} pr-8`}
            inputMode="decimal"
            value={value.replace(/%$/, "")}
            placeholder="8"
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onChange(formatPercent(e.target.value))}
          />
        </Adorned>
      );
    case "ordinal":
      return (
        <select className={cls} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Day of month —</option>
          {Array.from({ length: 28 }, (_, i) => ordinal(i + 1)).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
          {value && !/^\d+(st|nd|rd|th)$/.test(value) && <option value={value}>{value}</option>}
        </select>
      );
    case "number":
      return (
        <Adorned suffix={spec.unit}>
          <input className={`${cls} ${spec.unit ? "pr-16" : ""}`} type="number" min={0} value={value} onChange={(e) => onChange(e.target.value)} />
        </Adorned>
      );
    case "phone":
      return <input className={cls} type="tel" value={value} placeholder="(314) 555-0123" onChange={(e) => onChange(e.target.value)} onBlur={(e) => onChange(formatPhone(e.target.value))} />;
    case "email":
      return <input className={cls} type="email" value={value} onChange={(e) => onChange(e.target.value.trim())} />;
    case "longtext":
      return (
        <>
          <textarea className={cls} rows={2} value={value} placeholder={spec.placeholder} onChange={(e) => onChange(e.target.value)} />
          {spec.suggestions && (
            <div className="flex flex-wrap gap-1 mt-1">
              {spec.suggestions.map((s) => (
                <Chip key={s} onClick={() => onChange(s)}>{s}</Chip>
              ))}
            </div>
          )}
        </>
      );
    default:
      return (
        <>
          <input className={cls} list={listId} value={value} placeholder={spec.placeholder} onChange={(e) => onChange(e.target.value)} />
          {datalist}
        </>
      );
  }
}

/** Lease shortcuts: end date, prorated first payment, deposit size (with Missouri's 2-month cap). */
function Helpers({ fieldKey, values, set }: { fieldKey: string; values: FieldValues; set: (k: string, v: string) => void }) {
  const rent = parseMoney(values.monthly_rent ?? "");
  const startIso = displayDateToIso(values.lease_start ?? "");

  if (fieldKey === "lease_end" && startIso) {
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {[12, 6, 3].map((m) => (
          <Chip key={m} onClick={() => set("lease_end", isoToDisplayDate(leaseEndIso(startIso, m)))}>
            {m} months
          </Chip>
        ))}
      </div>
    );
  }
  if (fieldKey === "prorated_rent" && rent !== null && startIso) {
    const amount = proratedRent(rent, startIso);
    return (
      <div className="flex flex-wrap items-center gap-1 mt-1">
        <Chip onClick={() => set("prorated_rent", formatMoney(String(amount)))}>
          {amount === rent ? "Full month" : "Prorate"}: {formatMoney(String(amount))}
        </Chip>
      </div>
    );
  }
  if (fieldKey === "security_deposit" && rent !== null) {
    const deposit = parseMoney(values.security_deposit ?? "");
    return (
      <div className="mt-1 space-y-1">
        <div className="flex flex-wrap gap-1">
          <Chip onClick={() => set("security_deposit", formatMoney(String(rent)))}>1 month</Chip>
          <Chip onClick={() => set("security_deposit", formatMoney(String(rent * 1.5)))}>1.5 months</Chip>
          <Chip onClick={() => set("security_deposit", formatMoney(String(rent * 2)))}>2 months</Chip>
        </div>
        {deposit !== null && deposit > rent * 2 && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} /> Missouri caps deposits at 2 months' rent ({formatMoney(String(rent * 2))}).
          </p>
        )}
      </div>
    );
  }
  return null;
}

export default function TemplateFieldsForm({
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
  const utils = trpc.useUtils();
  const { properties, propertyLabel } = useParties();
  const [contextProperty, setContextProperty] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [onlyBlank, setOnlyBlank] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<FieldGroup>>(new Set(FIELD_GROUPS.filter((g) => g !== "Luxe (company)")));
  const edited = useRef(new Set<string>());
  const ready = party.kind === "none" || !!party.id;

  const fields = trpc.esign.templateFields.useQuery(
    { templateId, ...partyIds(party), ...(contextProperty ? { propertyId: contextProperty } : {}) },
    { enabled: ready }
  );
  const preview = trpc.esign.previewTemplate.useMutation({
    onSuccess: (r) => {
      const bytes = Uint8Array.from(atob(r.pdfBase64), (c) => c.charCodeAt(0));
      setPreviewUrl(URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })));
    },
    onError: (e) => toast.error(e.message),
  });
  const saveDefaults = trpc.esign.saveFieldDefaults.useMutation({
    onSuccess: (r) => {
      toast.success(r.saved.length ? `Saved ${r.saved.length} default${r.saved.length === 1 ? "" : "s"} for this template` : "Nothing to save — fill in fees or terms first");
      utils.esign.templateFields.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // Fill in what the site knows (and saved defaults) without overwriting anything typed by hand.
  useEffect(() => {
    if (!fields.data) return;
    onChange((prev) => {
      const next = { ...prev };
      for (const f of fields.data) if (!edited.current.has(f.key)) next[f.key] = f.value;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.data]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const set = (key: string, value: string) => {
    edited.current.add(key);
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const list = fields.data ?? [];
  const filled = list.filter((f) => values[f.key]?.trim()).length;
  const grouped = useMemo(() => {
    const map = new Map<FieldGroup, Field[]>();
    for (const f of list) {
      const g = fieldSpec(f.key).group;
      map.set(g, [...(map.get(g) ?? []), f]);
    }
    return FIELD_GROUPS.filter((g) => map.has(g)).map((g) => ({ group: g, fields: map.get(g)! }));
  }, [list]);
  const canSaveDefaults = list.some((f) => isDefaultable(f.key));

  const toggleGroup = (g: FieldGroup) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });

  return (
    <div className="border border-[#C9A84C]/40 bg-[#C9A84C]/5 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#0A1628]">Fill in the details</p>
          <p className="text-xs text-gray-500">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#C9A84C]/30 border border-[#C9A84C]/60 align-middle mr-1" />from the site
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-200 align-middle ml-3 mr-1" />your saved default
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-white border border-amber-300 align-middle ml-3 mr-1" />still blank
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {canSaveDefaults && (
            <button
              type="button"
              onClick={() => saveDefaults.mutate({ templateId, values })}
              disabled={saveDefaults.isPending || !fields.data}
              title="Remember fees and terms so they pre-fill every time you send this template"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {saveDefaults.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save as defaults
            </button>
          )}
          <button
            type="button"
            onClick={() => preview.mutate({ templateId, values })}
            disabled={preview.isPending || !fields.data}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {preview.isPending ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Preview
          </button>
        </div>
      </div>

      {(party.kind === "none" || party.kind === "owner") && (
        <div>
          <label className={labelCls}>Use property details from</label>
          <select className={inputClass("filled")} value={contextProperty} onChange={(e) => setContextProperty(e.target.value)}>
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
      ) : !list.length ? (
        <p className="text-sm text-gray-500">This template has no {"{{placeholders}}"}.</p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white rounded overflow-hidden border border-gray-200">
              <div className="h-full bg-[#C9A84C] transition-all" style={{ width: `${Math.round((filled / list.length) * 100)}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
              {filled} of {list.length} filled
            </span>
            <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap">
              <input type="checkbox" checked={onlyBlank} onChange={(e) => setOnlyBlank(e.target.checked)} /> Only blanks
            </label>
          </div>

          {grouped.map(({ group, fields: groupFields }) => {
            const visible = onlyBlank ? groupFields.filter((f) => !values[f.key]?.trim()) : groupFields;
            if (!visible.length) return null;
            const open = openGroups.has(group) || onlyBlank;
            const groupFilled = groupFields.filter((f) => values[f.key]?.trim()).length;
            return (
              <div key={group} className="bg-white/70 rounded-lg border border-gray-200">
                <button type="button" onClick={() => toggleGroup(group)} className="w-full flex items-center justify-between px-3 py-2 text-left">
                  <span className="text-sm font-semibold text-[#0A1628]">{group}</span>
                  <span className="flex items-center gap-2 text-xs text-gray-500">
                    {groupFilled}/{groupFields.length}
                    {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </button>
                {open && (
                  <div className="grid sm:grid-cols-2 gap-3 px-3 pb-3">
                    {visible.map((f) => {
                      const spec = fieldSpec(f.key);
                      const value = values[f.key] ?? "";
                      const untouched = !edited.current.has(f.key) && value === f.value && !!value;
                      const state = !value.trim() ? "blank" : untouched && f.source ? f.source : "filled";
                      return (
                        <div key={f.key} className={spec.kind === "longtext" ? "sm:col-span-2" : undefined}>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            {f.label} <span className="font-mono text-[10px] text-gray-400">{"{{" + f.key + "}}"}</span>
                          </label>
                          <FieldInput field={f} spec={spec} value={value} cls={inputClass(state)} onChange={(v) => set(f.key, v)} />
                          <Helpers fieldKey={f.key} values={values} set={set} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {previewUrl && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-[#0A1628]">Preview</h2>
                <p className="text-sm text-gray-500">This is exactly what signers will see</p>
              </div>
              <button type="button" onClick={() => setPreviewUrl(null)} className="text-gray-400 hover:text-gray-600" aria-label="Close preview">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto bg-gray-200/60 p-3">
              <PdfViewer url={previewUrl} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
