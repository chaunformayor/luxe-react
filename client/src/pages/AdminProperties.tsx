import React, { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { preparePhoto, uploadPhoto } from "@/lib/photoUpload";
import {
  PROPERTY_TYPES, RENTAL_TYPES, defaultUnitCount, isMultifamily, priceLabel, priceSuffix, propertyTypeLabel, rentalTypeLabel,
} from "@shared/propertyKinds";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronUp, X, Building2, Star,
  ImagePlus, Loader2,
} from "lucide-react";

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";
const cellCls = "w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";

type UnitStatus = "vacant" | "occupied" | "maintenance";
type UnitDraft = { unitNumber: string; beds: string; baths: string; sqft: string; rentAmount: string; status: UnitStatus };
const blankUnit = (unitNumber: string): UnitDraft => ({ unitNumber, beds: "", baths: "", sqft: "", rentAmount: "", status: "vacant" });

function rentHeading(rentalType: string) {
  return rentalType === "short_term" ? "Nightly rate" : "Rent/mo";
}

// ─── Units of a new multifamily (entered on the Add Property form) ─────────────
function UnitRowsEditor({ rows, onChange, rentalType }: { rows: UnitDraft[]; onChange: (rows: UnitDraft[]) => void; rentalType: string }) {
  const update = (i: number, key: keyof UnitDraft, value: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const total = (key: "beds" | "baths" | "sqft" | "rentAmount") => rows.reduce((t, r) => t + (Number(r[key]) || 0), 0);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Units ({rows.length})</span>
        <button type="button" onClick={() => onChange([...rows, blankUnit(String(rows.length + 1))])}
          className="flex items-center gap-1 text-xs font-semibold text-[#0A1628] hover:text-[#C9A84C]">
          <Plus size={14} /> Add unit
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="py-2 px-2 font-semibold">Unit # *</th>
              <th className="py-2 px-2 font-semibold">Beds</th>
              <th className="py-2 px-2 font-semibold">Baths</th>
              <th className="py-2 px-2 font-semibold">Sq ft</th>
              <th className="py-2 px-2 font-semibold">{rentHeading(rentalType)} *</th>
              <th className="py-2 px-2 font-semibold">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="py-1.5 px-2 w-20"><input value={r.unitNumber} onChange={e => update(i, "unitNumber", e.target.value)} placeholder="1A" className={cellCls} /></td>
                <td className="py-1.5 px-2 w-16"><input type="number" min="0" value={r.beds} onChange={e => update(i, "beds", e.target.value)} placeholder="2" className={cellCls} /></td>
                <td className="py-1.5 px-2 w-16"><input type="number" min="0" step="0.5" value={r.baths} onChange={e => update(i, "baths", e.target.value)} placeholder="1" className={cellCls} /></td>
                <td className="py-1.5 px-2 w-20"><input type="number" min="0" value={r.sqft} onChange={e => update(i, "sqft", e.target.value)} placeholder="850" className={cellCls} /></td>
                <td className="py-1.5 px-2 w-24"><input type="number" min="0" value={r.rentAmount} onChange={e => update(i, "rentAmount", e.target.value)} placeholder={rentalType === "short_term" ? "110" : "1100"} className={cellCls} /></td>
                <td className="py-1.5 px-2 w-28">
                  <select value={r.status} onChange={e => update(i, "status", e.target.value)} className={cellCls}>
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </td>
                <td className="py-1.5 px-2 w-8">
                  <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} title="Remove unit"
                    className="p-1 text-gray-400 hover:text-red-600"><X size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 1 && (
            <tfoot>
              <tr className="border-t bg-gray-50 text-xs text-gray-600">
                <td className="py-2 px-2 font-semibold">Total</td>
                <td className="py-2 px-2">{total("beds")}</td>
                <td className="py-2 px-2">{total("baths")}</td>
                <td className="py-2 px-2">{total("sqft").toLocaleString()}</td>
                <td className="py-2 px-2">{rentalType === "short_term" ? "" : `$${total("rentAmount").toLocaleString()}`}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ─── Property Form Modal ───────────────────────────────────────────────────────
function PropertyModal({
  initial,
  owners,
  onClose,
  onSave,
}: {
  initial?: any;
  owners: any[];
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const editing = !!initial;
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    zipCode: initial?.zipCode ?? "",
    price: initial?.price ?? "",
    type: initial?.type ?? "Rent",
    propertyType: (initial?.propertyType ?? "single_family") as string,
    rentalType: (initial?.rentalType ?? "long_term") as string,
    beds: initial?.beds ?? "",
    baths: initial?.baths ?? "",
    sqft: initial?.sqft ?? "",
    description: initial?.description ?? "",
    ownerId: initial?.ownerId ?? "",
    featured: initial?.featured ?? false,
    active: initial?.active ?? true,
  });

  // A new multifamily's units are entered here; an existing one's are edited under its row.
  const multifamily = isMultifamily(form.propertyType);
  const [unitRows, setUnitRows] = useState<UnitDraft[]>([]);
  const setPropertyType = (value: string) => {
    set("propertyType", value);
    if (!editing && isMultifamily(value)) {
      setUnitRows(rows => {
        const want = Math.max(rows.length, defaultUnitCount(value));
        return [...rows, ...Array.from({ length: want - rows.length }, (_, i) => blankUnit(String(rows.length + i + 1)))];
      });
    }
  };
  // Totals come from the units for a multifamily rented by the month; otherwise they're typed in.
  const rentFromUnits = multifamily && form.type === "Rent" && form.rentalType !== "short_term";
  const unitTotals = {
    beds: unitRows.reduce((t, u) => t + (Number(u.beds) || 0), 0),
    baths: unitRows.reduce((t, u) => t + (Number(u.baths) || 0), 0),
    sqft: unitRows.reduce((t, u) => t + (Number(u.sqft) || 0), 0),
    rent: unitRows.reduce((t, u) => t + (Number(u.rentAmount) || 0), 0),
  };
  const newMultifamily = multifamily && !editing;

  // Photo management
  const [images, setImages] = useState<string[]>(() => {
    try { return JSON.parse(initial?.images ?? "[]") as string[]; } catch { return []; }
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError(null);
    setUploading(true);
    // One bad photo shouldn't drop the rest: keep each success, list each failure
    const errors: string[] = [];
    for (const file of files) {
      try {
        const url = await uploadPhoto(await preparePhoto(file));
        setImages(prev => [...prev, url]);
      } catch (err: any) {
        errors.push(err.message ?? `${file.name}: upload failed`);
      }
    }
    if (errors.length) setUploadError(errors.join("\n"));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (url: string) => setImages(prev => prev.filter(u => u !== url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newMultifamily) {
      if (!unitRows.length) return setError("Add at least one unit.");
      const missing = unitRows.findIndex(u => !u.unitNumber.trim() || u.rentAmount === "");
      if (missing !== -1) return setError(`Unit ${missing + 1} needs a unit number and ${form.rentalType === "short_term" ? "nightly rate" : "rent"}.`);
    }
    setSaving(true);
    try {
      const { propertyType, rentalType } = form;
      await onSave({
        ...form,
        propertyType: propertyType as any,
        rentalType: (form.type === "Sale" ? "long_term" : rentalType) as any,
        // A new multifamily's totals are the sum of its units (the server keeps them in step after that)
        beds: newMultifamily ? unitTotals.beds : Number(form.beds),
        baths: newMultifamily ? unitTotals.baths : Number(form.baths),
        sqft: newMultifamily ? unitTotals.sqft : Number(form.sqft),
        price: newMultifamily && rentFromUnits ? unitTotals.rent.toFixed(2) : String(form.price),
        ownerId: form.ownerId || undefined,
        images: JSON.stringify(images),
        ...(newMultifamily
          ? {
              units: unitRows.map(u => ({
                unitNumber: u.unitNumber.trim(),
                rentAmount: String(Number(u.rentAmount) || 0),
                beds: u.beds === "" ? null : Number(u.beds),
                baths: u.baths === "" ? null : Number(u.baths),
                sqft: u.sqft === "" ? null : Number(u.sqft),
                status: u.status,
              })),
            }
          : {}),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save property.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-lg font-bold text-[#0A1628]">{editing ? "Edit Property" : "Add Property"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Property Name *</label>
              <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Maple Street Duplex" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Street Address *</label>
              <input required value={form.address} onChange={e => set("address", e.target.value)} placeholder="123 Main St" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">City *</label>
              <input required value={form.city} onChange={e => set("city", e.target.value)} placeholder="St. Louis" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">State *</label>
                <input required maxLength={2} value={form.state} onChange={e => set("state", e.target.value.toUpperCase())} placeholder="MO" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">ZIP *</label>
                <input required value={form.zipCode} onChange={e => set("zipCode", e.target.value)} placeholder="63101" className={inputCls} />
              </div>
            </div>
          </div>

          {/* What it is and how it's rented */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Property Type *</label>
              <select value={form.propertyType} onChange={e => setPropertyType(e.target.value)} className={inputCls}>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Listing *</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls}>
                <option value="Rent">For rent</option>
                <option value="Sale">For sale</option>
              </select>
            </div>
            {form.type === "Rent" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Rental Type *</label>
                <select value={form.rentalType} onChange={e => set("rentalType", e.target.value)} className={inputCls}>
                  {RENTAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">{RENTAL_TYPES.find(t => t.value === form.rentalType)?.hint}</p>
              </div>
            )}
          </div>

          {newMultifamily ? (
            <UnitRowsEditor rows={unitRows} onChange={setUnitRows} rentalType={form.type === "Rent" ? form.rentalType : "long_term"} />
          ) : multifamily ? (
            <p className="text-sm text-gray-600 bg-gray-50 border rounded-lg p-3">
              Beds, baths, sq ft{rentFromUnits ? " and rent" : ""} are the totals of this building's units ({form.beds || 0} bd · {Number(form.baths) || 0} ba · {Number(form.sqft || 0).toLocaleString()} sqft
              {rentFromUnits ? ` · $${Number(form.price || 0).toLocaleString()}/mo` : ""}). Expand the property in the list to edit its units.
            </p>
          ) : null}

          {/* Price and size (typed in unless they come from the units) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {!rentFromUnits && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">{priceLabel(form.type, form.rentalType)} *</label>
                <input required type="number" min="0" value={form.price} onChange={e => set("price", e.target.value)}
                  placeholder={form.type === "Sale" ? "250000" : form.rentalType === "short_term" ? "125" : "1400"} className={inputCls} />
              </div>
            )}
            {!multifamily && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Beds *</label>
                  <input required type="number" min="0" value={form.beds} onChange={e => set("beds", e.target.value)} placeholder="3" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Baths *</label>
                  <input required type="number" min="0" step="0.5" value={form.baths} onChange={e => set("baths", e.target.value)} placeholder="1.5" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Sq Ft *</label>
                  <input required type="number" min="0" value={form.sqft} onChange={e => set("sqft", e.target.value)} placeholder="1200" className={inputCls} />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Assign to Owner</label>
              <select value={form.ownerId} onChange={e => set("ownerId", e.target.value)} className={inputCls}>
                <option value="">— Unassigned —</option>
                {owners.map((o: any) => (
                  <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Property description..." className={inputCls} />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Property Photos</label>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((url) => (
                  <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt="property" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#C9A84C] hover:text-[#C9A84C] transition w-full justify-center disabled:opacity-50">
              {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><ImagePlus size={16} /> Add Photos</>}
            </button>
            {uploadError && <p className="text-xs text-red-600 mt-1 whitespace-pre-line">{uploadError}</p>}
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => set("active", e.target.checked)} className="w-4 h-4 accent-[#C9A84C]" />
              <span className="text-sm font-medium text-gray-700">Active — show on the website's Listings page</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} className="w-4 h-4 accent-[#C9A84C]" />
              <span className="text-sm font-medium text-gray-700">Featured listing</span>
            </label>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Units Manager (inline per property) ──────────────────────────────────────
function UnitsManager({ propertyId, rentalType }: { propertyId: string; rentalType: string }) {
  const utils = trpc.useUtils();
  const { data: units = [], isLoading } = trpc.admin.getUnitsForProperty.useQuery(propertyId);
  // A multifamily's totals follow its units, so refresh the property list too
  const refresh = () => { utils.admin.getUnitsForProperty.invalidate(propertyId); utils.admin.getAllProperties.invalidate(); };
  const onError = (e: { message: string }) => alert(e.message);
  const createUnit = trpc.admin.createUnit.useMutation({ onSuccess: refresh, onError });
  const updateUnit = trpc.admin.updateUnit.useMutation({ onSuccess: refresh, onError });
  const deleteUnit = trpc.admin.deleteUnit.useMutation({ onSuccess: refresh, onError });

  const [adding, setAdding] = useState(false);
  const [newUnit, setNewUnit] = useState<UnitDraft>(blankUnit(""));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UnitDraft>(blankUnit(""));
  const toPayload = (u: UnitDraft) => ({
    unitNumber: u.unitNumber.trim(),
    rentAmount: String(Number(u.rentAmount) || 0),
    beds: u.beds === "" ? null : Number(u.beds),
    baths: u.baths === "" ? null : Number(u.baths),
    sqft: u.sqft === "" ? null : Number(u.sqft),
    status: u.status,
  });
  const fromUnit = (u: any): UnitDraft => ({
    unitNumber: u.unitNumber ?? "",
    beds: u.beds == null ? "" : String(u.beds),
    baths: u.baths == null ? "" : String(Number(u.baths)),
    sqft: u.sqft == null ? "" : String(u.sqft),
    rentAmount: String(Number(u.rentAmount)),
    status: (u.status ?? "vacant") as UnitStatus,
  });
  const sizeText = (u: any) =>
    [u.beds != null && `${u.beds} bd`, u.baths != null && `${Number(u.baths)} ba`, u.sqft != null && `${Number(u.sqft).toLocaleString()} sqft`]
      .filter(Boolean)
      .join(" · ") || "—";

  const statusColors: Record<string, string> = {
    vacant: "bg-green-100 text-green-700",
    occupied: "bg-blue-100 text-blue-700",
    maintenance: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="mt-3 border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b">
        <span className="text-sm font-bold text-gray-700">Units ({units.length})</span>
        <button onClick={() => setAdding(a => !a)} className="flex items-center gap-1.5 text-xs font-semibold text-[#0A1628] hover:text-[#C9A84C] transition">
          <Plus size={14} /> Add Unit
        </button>
      </div>

      {adding && (
        <div className="flex flex-wrap gap-3 items-end p-3 bg-amber-50 border-b">
          <div className="w-20">
            <label className="block text-xs text-gray-500 mb-1">Unit #</label>
            <input value={newUnit.unitNumber} onChange={e => setNewUnit(u => ({ ...u, unitNumber: e.target.value }))}
              placeholder="1A" className={inputCls} />
          </div>
          <div className="w-16">
            <label className="block text-xs text-gray-500 mb-1">Beds</label>
            <input type="number" min="0" value={newUnit.beds} onChange={e => setNewUnit(u => ({ ...u, beds: e.target.value }))} placeholder="2" className={inputCls} />
          </div>
          <div className="w-16">
            <label className="block text-xs text-gray-500 mb-1">Baths</label>
            <input type="number" min="0" step="0.5" value={newUnit.baths} onChange={e => setNewUnit(u => ({ ...u, baths: e.target.value }))} placeholder="1" className={inputCls} />
          </div>
          <div className="w-20">
            <label className="block text-xs text-gray-500 mb-1">Sq ft</label>
            <input type="number" min="0" value={newUnit.sqft} onChange={e => setNewUnit(u => ({ ...u, sqft: e.target.value }))} placeholder="850" className={inputCls} />
          </div>
          <div className="w-24">
            <label className="block text-xs text-gray-500 mb-1">{rentHeading(rentalType)}</label>
            <input type="number" min="0" value={newUnit.rentAmount} onChange={e => setNewUnit(u => ({ ...u, rentAmount: e.target.value }))}
              placeholder={rentalType === "short_term" ? "110" : "1200"} className={inputCls} />
          </div>
          <div className="w-32">
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select value={newUnit.status} onChange={e => setNewUnit(u => ({ ...u, status: e.target.value as UnitStatus }))} className={inputCls}>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <button
            onClick={() => {
              if (!newUnit.unitNumber.trim() || newUnit.rentAmount === "") return;
              createUnit.mutate({ propertyId, ...toPayload(newUnit) });
              setNewUnit(blankUnit(""));
              setAdding(false);
            }}
            className="px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90"
          >
            Save
          </button>
          <button onClick={() => setAdding(false)} className="px-3 py-2 text-gray-500 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="p-3 text-sm text-gray-400">Loading units...</div>
      ) : units.length === 0 && !adding ? (
        <div className="p-4 text-sm text-gray-400 text-center">No units yet. Click "Add Unit" to create one.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500">Unit</th>
              <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500">Size</th>
              <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500">{rentHeading(rentalType)}</th>
              <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500">Status</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {(units as any[]).map((unit: any) => (
              <tr key={unit.id} className="border-b last:border-0 hover:bg-gray-50">
                {editingId === unit.id ? (
                  <>
                    <td className="py-2 px-4"><input value={editForm.unitNumber} onChange={e => setEditForm(f => ({ ...f, unitNumber: e.target.value }))} className={cellCls} /></td>
                    <td className="py-2 px-4">
                      <div className="flex gap-1">
                        <input type="number" min="0" title="Beds" placeholder="bd" value={editForm.beds} onChange={e => setEditForm(f => ({ ...f, beds: e.target.value }))} className={`${cellCls} w-14`} />
                        <input type="number" min="0" step="0.5" title="Baths" placeholder="ba" value={editForm.baths} onChange={e => setEditForm(f => ({ ...f, baths: e.target.value }))} className={`${cellCls} w-14`} />
                        <input type="number" min="0" title="Sq ft" placeholder="sqft" value={editForm.sqft} onChange={e => setEditForm(f => ({ ...f, sqft: e.target.value }))} className={`${cellCls} w-20`} />
                      </div>
                    </td>
                    <td className="py-2 px-4"><input type="number" min="0" value={editForm.rentAmount} onChange={e => setEditForm(f => ({ ...f, rentAmount: e.target.value }))} className={cellCls} /></td>
                    <td className="py-2 px-4">
                      <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as UnitStatus }))} className={cellCls}>
                        <option value="vacant">Vacant</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => { updateUnit.mutate({ id: unit.id, ...toPayload(editForm) }); setEditingId(null); }}
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded font-semibold hover:bg-green-700">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 px-4 font-medium text-gray-800">Unit {unit.unitNumber}</td>
                    <td className="py-2 px-4 text-gray-600">{sizeText(unit)}</td>
                    <td className="py-2 px-4 text-gray-600">${Number(unit.rentAmount).toLocaleString()}{rentalType === "short_term" ? "/night" : ""}</td>
                    <td className="py-2 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[unit.status ?? "vacant"]}`}>
                        {(unit.status ?? "vacant").charAt(0).toUpperCase() + (unit.status ?? "vacant").slice(1)}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setEditingId(unit.id); setEditForm(fromUnit(unit)); }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                        <button onClick={() => { if (window.confirm(`Delete unit ${unit.unitNumber}?`)) deleteUnit.mutate(unit.id); }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Property Row ──────────────────────────────────────────────────────────────
function PropertyRow({ property, owners, onEdit, onDelete, onToggleFeatured }: {
  property: any; owners: any[]; onEdit: (p: any) => void; onDelete: (id: string) => void; onToggleFeatured: (p: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ownerName = owners.find((o: any) => o.id === property.ownerId)?.name;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Building2 className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[#0A1628] truncate">{property.name}</p>
              {property.featured && <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />}
            </div>
            <p className="text-sm text-gray-500 truncate">{property.address}, {property.city}, {property.state}</p>
            {ownerName && <p className="text-xs text-blue-600 mt-0.5">Owner: {ownerName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden md:inline text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700">
            {propertyTypeLabel(property.propertyType)}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${property.type === "Rent" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
            {property.type === "Rent" ? (property.rentalType === "long_term" ? "Rent" : rentalTypeLabel(property.rentalType)) : "Sale"}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            ${Number(property.price).toLocaleString()}{priceSuffix(property.type, property.rentalType)}
            {isMultifamily(property.propertyType) && property.type === "Rent" && property.rentalType !== "short_term" && <span className="font-normal text-gray-500"> total</span>}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${property.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {property.active ? "Active" : "Inactive"}
          </span>
          <div className="flex gap-1">
            <button onClick={() => onToggleFeatured(property)} title={property.featured ? "Remove from featured" : "Feature this property"}
              className={`p-1.5 rounded hover:bg-yellow-50 transition ${property.featured ? "text-yellow-500" : "text-gray-400"}`}>
              <Star size={16} className={property.featured ? "fill-yellow-500" : ""} />
            </button>
            <button onClick={() => onEdit(property)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
            <button onClick={() => onDelete(property.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
          </div>
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t px-4 pb-4 pt-2 bg-gray-50">
          {property.description && <p className="text-sm text-gray-600 mb-3">{property.description}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            <span className="font-medium text-gray-700">{propertyTypeLabel(property.propertyType)}</span>
            <span>{property.beds} bed</span>
            <span>{Number(property.baths)} bath</span>
            <span>{Number(property.sqft).toLocaleString()} sqft</span>
            {isMultifamily(property.propertyType) && <span className="text-gray-500">(totals of all units)</span>}
          </div>
          {(() => {
            try {
              const imgs: string[] = JSON.parse(property.images ?? "[]");
              if (imgs.length > 0) return (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {imgs.map(url => (
                    <div key={url} className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} alt="property" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              );
            } catch {}
            return null;
          })()}
          <UnitsManager propertyId={property.id} rentalType={property.type === "Rent" ? property.rentalType : "long_term"} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminProperties() {
  const utils = trpc.useUtils();
  const { data: properties, isLoading } = trpc.admin.getAllProperties.useQuery();
  const { data: owners = [] } = trpc.admin.getUsersByRole.useQuery("owner");

  const createMutation = trpc.admin.createProperty.useMutation({ onSuccess: () => utils.admin.getAllProperties.invalidate() });
  const updateMutation = trpc.admin.updateProperty.useMutation({ onSuccess: () => utils.admin.getAllProperties.invalidate() });
  const deleteMutation = trpc.admin.deleteProperty.useMutation({ onSuccess: () => utils.admin.getAllProperties.invalidate() });

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this property and its units? This cannot be undone.")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <AdminLayout>
      {(showAdd || editTarget) && (
        <PropertyModal
          initial={editTarget}
          owners={owners as any[]}
          onClose={() => { setShowAdd(false); setEditTarget(null); }}
          onSave={async (data) => {
            if (editTarget) {
              await updateMutation.mutateAsync({ id: editTarget.id, ...data });
            } else {
              await createMutation.mutateAsync(data);
            }
          }}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-sm text-gray-500 mt-1">Expand a property to manage its units</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-semibold hover:bg-[#0A1628]/90 transition"
          >
            <Plus size={16} /> Add Property
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : !properties || properties.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No properties yet</p>
              <p className="text-sm mt-1">Click "Add Property" to create your first listing.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(properties as any[]).map((p: any) => (
              <PropertyRow
                key={p.id}
                property={p}
                owners={owners as any[]}
                onEdit={setEditTarget}
                onDelete={handleDelete}
                onToggleFeatured={(prop) => updateMutation.mutate({ id: prop.id, featured: !prop.featured })}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
