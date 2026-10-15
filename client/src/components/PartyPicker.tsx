import { trpc } from "@/lib/trpc";

export type PartyKind = "none" | "tenant" | "owner" | "property";
export type PartySelection = { kind: PartyKind; id: string };

export const NO_PARTY: PartySelection = { kind: "none", id: "" };

export function partyIds(p: PartySelection) {
  if (!p.id) return {};
  if (p.kind === "tenant") return { tenantId: p.id };
  if (p.kind === "owner") return { ownerUserId: p.id };
  if (p.kind === "property") return { propertyId: p.id };
  return {};
}

export function useParties() {
  const { data } = trpc.documents.parties.useQuery();
  const tenants = data?.tenants ?? [];
  const owners = data?.owners ?? [];
  const properties = data?.properties ?? [];

  const tenantLabel = (t: (typeof tenants)[number]) =>
    `${t.name || t.email || "Tenant"}${t.propertyName ? ` — ${t.propertyName}${t.unitNumber ? ` #${t.unitNumber}` : ""}` : ""}`;
  const ownerLabel = (o: (typeof owners)[number]) => o.name || o.email || "Owner";
  const propertyLabel = (p: (typeof properties)[number]) => p.name || p.address;

  function describe(share: { tenantId?: string | null; ownerUserId?: string | null; propertyId?: string | null }) {
    if (share.tenantId) {
      const t = tenants.find((x) => x.id === share.tenantId);
      return `Tenant: ${t ? t.name || t.email : "unknown"}`;
    }
    if (share.ownerUserId) {
      const o = owners.find((x) => x.id === share.ownerUserId);
      return `Owner: ${o ? ownerLabel(o) : "unknown"}`;
    }
    if (share.propertyId) {
      const p = properties.find((x) => x.id === share.propertyId);
      return `Property: ${p ? propertyLabel(p) : "unknown"}`;
    }
    return "—";
  }

  return { tenants, owners, properties, tenantLabel, ownerLabel, propertyLabel, describe };
}

const selectCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";

export default function PartyPicker({
  value,
  onChange,
  noneLabel = "No one in particular",
  kinds = ["tenant", "owner", "property"],
}: {
  value: PartySelection;
  onChange: (value: PartySelection) => void;
  noneLabel?: string;
  kinds?: Exclude<PartyKind, "none">[];
}) {
  const { tenants, owners, properties, tenantLabel, ownerLabel, propertyLabel } = useParties();

  const options =
    value.kind === "tenant"
      ? tenants.map((t) => ({ id: t.id, label: tenantLabel(t) }))
      : value.kind === "owner"
        ? owners.map((o) => ({ id: o.id, label: ownerLabel(o) }))
        : value.kind === "property"
          ? properties.map((p) => ({ id: p.id, label: propertyLabel(p) }))
          : [];

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <select
        className={selectCls}
        value={value.kind}
        onChange={(e) => onChange({ kind: e.target.value as PartyKind, id: "" })}
      >
        <option value="none">{noneLabel}</option>
        {kinds.includes("tenant") && <option value="tenant">A tenant</option>}
        {kinds.includes("owner") && <option value="owner">An owner</option>}
        {kinds.includes("property") && <option value="property">A property</option>}
      </select>
      {value.kind !== "none" && (
        <select className={selectCls} value={value.id} onChange={(e) => onChange({ ...value, id: e.target.value })}>
          <option value="">— Select {value.kind} —</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
