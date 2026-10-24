// What kind of building a property is, and how it's rented. Shared by the admin form, the
// public listings, the owner portal and document auto-fill.

export const PROPERTY_TYPES = [
  { value: "single_family", label: "Single-family home", units: 1 },
  { value: "duplex", label: "Duplex", units: 2 },
  { value: "triplex", label: "Triplex", units: 3 },
  { value: "fourplex", label: "Fourplex", units: 4 },
  { value: "multifamily", label: "Multifamily (5+ units)", units: 5 },
  { value: "condo", label: "Condo", units: 1 },
  { value: "townhome", label: "Townhome", units: 1 },
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number]["value"];
export const PROPERTY_TYPE_VALUES = PROPERTY_TYPES.map((t) => t.value) as [PropertyType, ...PropertyType[]];

export const RENTAL_TYPES = [
  { value: "long_term", label: "Long-term", hint: "Leases of 12 months or so" },
  { value: "mid_term", label: "Mid-term", hint: "Furnished, 30+ day stays" },
  { value: "short_term", label: "Short-term (STR)", hint: "Nightly stays (Airbnb, VRBO)" },
] as const;
export type RentalType = (typeof RENTAL_TYPES)[number]["value"];
export const RENTAL_TYPE_VALUES = RENTAL_TYPES.map((t) => t.value) as [RentalType, ...RentalType[]];

/** Buildings whose units are entered one by one (and whose totals come from those units). */
export function isMultifamily(type: string | null | undefined) {
  return type === "duplex" || type === "triplex" || type === "fourplex" || type === "multifamily";
}

export function propertyTypeLabel(type: string | null | undefined) {
  return PROPERTY_TYPES.find((t) => t.value === type)?.label ?? "Single-family home";
}

export function rentalTypeLabel(type: string | null | undefined) {
  return RENTAL_TYPES.find((t) => t.value === type)?.label ?? "Long-term";
}

/** Default number of units for a building type (5 for "5+"). */
export function defaultUnitCount(type: string | null | undefined) {
  return PROPERTY_TYPES.find((t) => t.value === type)?.units ?? 1;
}

/** "/night" for short-term rentals, "/mo" for other rentals, "" for sales. */
export function priceSuffix(listing: string | null | undefined, rentalType: string | null | undefined) {
  if (listing === "Sale") return "";
  return rentalType === "short_term" ? "/night" : "/mo";
}

/** What the price field means for a listing. */
export function priceLabel(listing: string | null | undefined, rentalType: string | null | undefined) {
  if (listing === "Sale") return "Sale price";
  return rentalType === "short_term" ? "Nightly rate" : "Monthly rent";
}
