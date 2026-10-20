import { eq } from "drizzle-orm";
import { properties, tenants, units, users } from "../../drizzle/schema";
import { requireDb } from "../documentsRouter";

/** Placeholders the site can fill in by itself. Anything else in a template is typed in when sending. */
export const STANDARD_FIELDS: { key: string; label: string; source: string }[] = [
  { key: "today", label: "Today's date", source: "Date the document is sent" },
  { key: "tenant_name", label: "Tenant name", source: "Tenant's account" },
  { key: "tenant_email", label: "Tenant email", source: "Tenant's account" },
  { key: "owner_name", label: "Owner name", source: "Owner's account (or the property's owner)" },
  { key: "owner_email", label: "Owner email", source: "Owner's account (or the property's owner)" },
  { key: "property_name", label: "Property name", source: "Property" },
  { key: "property_address", label: "Street address", source: "Property" },
  { key: "property_city", label: "City", source: "Property" },
  { key: "property_state", label: "State", source: "Property" },
  { key: "property_zip", label: "ZIP", source: "Property" },
  { key: "property_full_address", label: "Full address", source: "Property (street, city, state ZIP)" },
  { key: "property_beds", label: "Bedrooms", source: "Property" },
  { key: "property_baths", label: "Bathrooms", source: "Property" },
  { key: "unit_number", label: "Unit number", source: "Tenant's unit" },
  { key: "monthly_rent", label: "Monthly rent", source: "Tenant's unit (or the property's listed rent)" },
  { key: "lease_start", label: "Lease start date", source: "Tenant record" },
  { key: "lease_end", label: "Lease end date", source: "Tenant record" },
  { key: "company_name", label: "Company name", source: "Luxe Property Solutions" },
  { key: "company_address", label: "Company address", source: "Luxe Property Solutions" },
  { key: "company_phone", label: "Company phone", source: "Luxe Property Solutions" },
  { key: "company_email", label: "Company email", source: "Luxe Property Solutions" },
];

const LABELS = new Map(STANDARD_FIELDS.map((f) => [f.key, f.label]));

export function labelFor(key: string) {
  return LABELS.get(key) ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "long", day: "numeric", year: "numeric" });
// Lease dates are stored as midnight UTC calendar dates; format them in UTC so they don't shift a day.
const calendarFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });

function money(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-US", { style: "currency", currency: "USD" }) : String(value);
}

export type FieldContext = { tenantId?: string | null; ownerUserId?: string | null; propertyId?: string | null };

/** Values the site already knows for this tenant/owner/property. Unknown fields are left out. */
export async function resolveFieldValues(ctx: FieldContext): Promise<Record<string, string>> {
  const db = await requireDb();
  const values: Record<string, string> = {
    today: dateFmt.format(new Date()),
    company_name: "Luxe Property Solutions",
    company_address: "555 Washington Ave, St. Louis, MO 63101",
    company_phone: "636.201.1239",
    company_email: "info@luxestl.com",
  };

  let propertyId = ctx.propertyId ?? null;
  let ownerId = ctx.ownerUserId ?? null;

  if (ctx.tenantId) {
    const [t] = await db
      .select({
        name: users.name,
        email: users.email,
        leaseStartDate: tenants.leaseStartDate,
        leaseEndDate: tenants.leaseEndDate,
        unitNumber: units.unitNumber,
        rentAmount: units.rentAmount,
        propertyId: units.propertyId,
      })
      .from(tenants)
      .leftJoin(users, eq(tenants.userId, users.id))
      .leftJoin(units, eq(tenants.unitId, units.id))
      .where(eq(tenants.id, ctx.tenantId))
      .limit(1);
    if (t) {
      if (t.name) values.tenant_name = t.name;
      if (t.email) values.tenant_email = t.email;
      if (t.unitNumber) values.unit_number = t.unitNumber;
      if (t.rentAmount) values.monthly_rent = money(t.rentAmount);
      if (t.leaseStartDate) values.lease_start = calendarFmt.format(new Date(t.leaseStartDate));
      if (t.leaseEndDate) values.lease_end = calendarFmt.format(new Date(t.leaseEndDate));
      propertyId ??= t.propertyId ?? null;
    }
  }

  if (!propertyId && ownerId) {
    const owned = await db.select({ id: properties.id }).from(properties).where(eq(properties.ownerId, ownerId));
    if (owned.length === 1) propertyId = owned[0].id;
  }

  if (propertyId) {
    const [p] = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
    if (p) {
      values.property_name = p.name;
      values.property_address = p.address;
      values.property_city = p.city;
      values.property_state = p.state;
      values.property_zip = p.zipCode;
      values.property_full_address = `${p.address}, ${p.city}, ${p.state} ${p.zipCode}`;
      values.property_beds = String(p.beds);
      values.property_baths = String(Number(p.baths));
      if (!values.monthly_rent && p.type === "Rent") values.monthly_rent = money(p.price);
      ownerId ??= p.ownerId ?? null;
    }
  }

  if (ownerId) {
    const [o] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, ownerId)).limit(1);
    if (o?.name) values.owner_name = o.name;
    if (o?.email) values.owner_email = o.email;
  }

  return values;
}
