// How each {{placeholder}} is edited on the send form, inferred from its name so new
// templates get sensible inputs without any setup.

export type FieldKind = "text" | "longtext" | "date" | "money" | "percent" | "number" | "ordinal" | "email" | "phone";

export type FieldSpec = {
  kind: FieldKind;
  group: FieldGroup;
  suggestions?: string[];
  unit?: string;
  placeholder?: string;
};

export const FIELD_GROUPS = ["Owner", "Tenant", "Property", "Lease terms", "Fees & payments", "Agreement terms", "Other", "Luxe (company)"] as const;
export type FieldGroup = (typeof FIELD_GROUPS)[number];

const EXACT: Record<string, Partial<FieldSpec>> = {
  today: { kind: "date", group: "Agreement terms" },
  properties: { group: "Property" },
  currently_occupied: { suggestions: ["Yes", "No"] },
  payout_method: { suggestions: ["ACH direct deposit", "Check"] },
  owner_preferred_contact: { suggestions: ["Call", "Text", "Email"] },
  owner_emergency_contact: { placeholder: "Name and phone" },
  owner_mailing_address: { kind: "longtext" },
  property_type: { suggestions: ["Single-family home", "Duplex", "Multi-family", "Condo", "Townhome"] },
  mortgage_lender: { suggestions: ["None"] },
  hoa: { suggestions: ["None"] },
  pets_allowed: { suggestions: ["No", "Yes", "Yes, one pet", "Yes, up to two pets"] },
  setup_fee: { suggestions: ["Waived"] },
  current_lease_end: { suggestions: ["N/A (vacant)"] },
  parking: { suggestions: ["Street parking", "One assigned space", "Driveway", "Garage"] },
  additional_terms: { kind: "longtext", suggestions: ["None."] },
  additional_occupants: { kind: "longtext", suggestions: ["None"] },
  included_items: { kind: "longtext", placeholder: "Refrigerator, range, dishwasher…" },
  pet_description: { kind: "longtext", placeholder: "Name, type, breed, weight", suggestions: ["None"] },
  tenant_utilities: { kind: "longtext", group: "Lease terms", placeholder: "Electric, gas, internet…" },
  landlord_utilities: { kind: "longtext", placeholder: "Water, sewer, trash…" },
};

function inferKind(key: string): FieldKind {
  if (/(_date|_start|_end|_expires)$/.test(key)) return "date";
  if (/_email$/.test(key)) return "email";
  if (/_phone$/.test(key)) return "phone";
  if (/_(rate|percent)$/.test(key)) return "percent";
  if (/(rent|fee|deposit|reserve|limit|threshold|amount|price)$/.test(key)) return "money";
  if (/_day$/.test(key)) return "ordinal";
  if (/_(months|days|count|beds|baths)$/.test(key)) return "number";
  return "text";
}

function inferGroup(key: string): FieldGroup {
  if (key.startsWith("company_")) return "Luxe (company)";
  if (key.startsWith("owner_") || key === "payout_method") return "Owner";
  if (key.startsWith("tenant_") || key === "additional_occupants") return "Tenant";
  if (
    key.startsWith("property_") ||
    key.startsWith("current_") ||
    ["unit_number", "currently_occupied", "target_rent", "mortgage_lender", "hoa"].includes(key) ||
    key.startsWith("insurance_")
  )
    return "Property";
  if (key.startsWith("agreement_") || key.startsWith("termination_") || key.startsWith("early_termination") || key === "additional_terms") return "Agreement terms";
  if (/^(lease_|monthly_rent|prorated_rent|security_deposit|late_|returned_|pet|parking|included_items|tenant_utilities|landlord_utilities)/.test(key)) return "Lease terms";
  if (/(fee|_rate|reserve|limit|threshold|statement_day)/.test(key)) return "Fees & payments";
  return "Other";
}

export function fieldSpec(key: string): FieldSpec {
  const exact = EXACT[key] ?? {};
  const kind = exact.kind ?? inferKind(key);
  return {
    kind,
    group: exact.group ?? inferGroup(key),
    suggestions: exact.suggestions,
    placeholder: exact.placeholder,
    unit: kind === "number" ? (key.endsWith("_months") ? "months" : key.endsWith("_days") ? "days" : undefined) : undefined,
  };
}

/** Fields the first signer can be asked to fill in on the signing page. */
export function isAskable(key: string) {
  return key !== "today" && key !== "properties" && !key.startsWith("properties.") && fieldSpec(key).group !== "Luxe (company)";
}

/** Fields worth remembering per template (policies like fees), not per-person or per-property details. */
export function isDefaultable(key: string) {
  if (key.includes(".")) return false; // columns of the properties list
  const spec = fieldSpec(key);
  if (spec.kind === "date") return false;
  if (["Owner", "Tenant", "Property", "Luxe (company)"].includes(spec.group)) return false;
  return !["monthly_rent", "prorated_rent", "security_deposit", "pet_description", "additional_occupants"].includes(key);
}

// ── Formatting: values are stored exactly as they'll print in the document ──

const longDate = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });

export function isoToDisplayDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return longDate.format(new Date(`${iso}T00:00:00Z`));
}

export function displayDateToIso(display: string) {
  if (!display.trim()) return "";
  const parsed = new Date(`${display} 00:00:00 UTC`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export function parseMoney(value: string): number | null {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

export function formatMoney(value: string) {
  const n = parseMoney(value);
  return n === null ? value.trim() : n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function formatPercent(value: string) {
  const cleaned = value.replace(/[%\s]/g, "");
  return /^\d+(\.\d+)?$/.test(cleaned) ? `${Number(cleaned)}%` : value.trim();
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith("1")) return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return value.trim();
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/** First payment for a lease starting mid-month: daily rate × days remaining in that month. */
export function proratedRent(monthlyRent: number, startIso: string) {
  const [y, m, d] = startIso.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (d === 1) return monthlyRent;
  return Math.round(((monthlyRent * (daysInMonth - d + 1)) / daysInMonth) * 100) / 100;
}

/** End date for a term of `months` starting on `startIso` (the day before the same date N months later). */
export function leaseEndIso(startIso: string, months: number) {
  const [y, m, d] = startIso.split("-").map(Number);
  const end = new Date(Date.UTC(y, m - 1 + months, d));
  end.setUTCDate(end.getUTCDate() - 1);
  return end.toISOString().slice(0, 10);
}
