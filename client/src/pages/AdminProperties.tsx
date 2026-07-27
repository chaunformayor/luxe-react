import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronUp, X, Building2, Star
} from "lucide-react";

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";

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
    beds: initial?.beds ?? "",
    baths: initial?.baths ?? "",
    sqft: initial?.sqft ?? "",
    description: initial?.description ?? "",
    ownerId: initial?.ownerId ?? "",
    featured: initial?.featured ?? false,
    active: initial?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave({
        ...form,
        beds: Number(form.beds),
        baths: Number(form.baths),
        sqft: Number(form.sqft),
        ownerId: form.ownerId || undefined,
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

          {/* Listing Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Type *</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls}>
                <option value="Rent">Rent</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Price/mo *</label>
              <input required type="number" min="0" value={form.price} onChange={e => set("price", e.target.value)} placeholder="1400" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Beds *</label>
              <input required type="number" min="0" value={form.beds} onChange={e => set("beds", e.target.value)} placeholder="3" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Baths *</label>
              <input required type="number" min="0" step="0.5" value={form.baths} onChange={e => set("baths", e.target.value)} placeholder="1.5" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Sq Ft *</label>
              <input required type="number" min="0" value={form.sqft} onChange={e => set("sqft", e.target.value)} placeholder="1200" className={inputCls} />
            </div>
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

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} className="w-4 h-4 accent-[#C9A84C]" />
              <span className="text-sm font-medium text-gray-700">Featured listing</span>
            </label>
            {editing && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => set("active", e.target.checked)} className="w-4 h-4 accent-[#C9A84C]" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            )}
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
function UnitsManager({ propertyId }: { propertyId: string }) {
  const utils = trpc.useUtils();
  const { data: units = [], isLoading } = trpc.admin.getUnitsForProperty.useQuery(propertyId);
  const createUnit = trpc.admin.createUnit.useMutation({ onSuccess: () => utils.admin.getUnitsForProperty.invalidate(propertyId) });
  const updateUnit = trpc.admin.updateUnit.useMutation({ onSuccess: () => utils.admin.getUnitsForProperty.invalidate(propertyId) });
  const deleteUnit = trpc.admin.deleteUnit.useMutation({ onSuccess: () => utils.admin.getUnitsForProperty.invalidate(propertyId) });

  const [adding, setAdding] = useState(false);
  const [newUnit, setNewUnit] = useState({ unitNumber: "", rentAmount: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

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
        <div className="flex gap-3 items-end p-3 bg-amber-50 border-b">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Unit #</label>
            <input value={newUnit.unitNumber} onChange={e => setNewUnit(u => ({ ...u, unitNumber: e.target.value }))}
              placeholder="1A" className={inputCls} />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Rent/mo</label>
            <input type="number" value={newUnit.rentAmount} onChange={e => setNewUnit(u => ({ ...u, rentAmount: e.target.value }))}
              placeholder="1200" className={inputCls} />
          </div>
          <button
            onClick={() => {
              if (!newUnit.unitNumber || !newUnit.rentAmount) return;
              createUnit.mutate({ propertyId, ...newUnit });
              setNewUnit({ unitNumber: "", rentAmount: "" });
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
              <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500">Rent/mo</th>
              <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500">Status</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {(units as any[]).map((unit: any) => (
              <tr key={unit.id} className="border-b last:border-0 hover:bg-gray-50">
                {editingId === unit.id ? (
                  <>
                    <td className="py-2 px-4"><input value={editForm.unitNumber} onChange={e => setEditForm((f: any) => ({ ...f, unitNumber: e.target.value }))} className={inputCls} /></td>
                    <td className="py-2 px-4"><input type="number" value={editForm.rentAmount} onChange={e => setEditForm((f: any) => ({ ...f, rentAmount: e.target.value }))} className={inputCls} /></td>
                    <td className="py-2 px-4">
                      <select value={editForm.status} onChange={e => setEditForm((f: any) => ({ ...f, status: e.target.value }))} className={inputCls}>
                        <option value="vacant">Vacant</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => { updateUnit.mutate({ id: unit.id, ...editForm }); setEditingId(null); }}
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded font-semibold hover:bg-green-700">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 px-4 font-medium text-gray-800">Unit {unit.unitNumber}</td>
                    <td className="py-2 px-4 text-gray-600">${Number(unit.rentAmount).toLocaleString()}</td>
                    <td className="py-2 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[unit.status ?? "vacant"]}`}>
                        {(unit.status ?? "vacant").charAt(0).toUpperCase() + (unit.status ?? "vacant").slice(1)}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setEditingId(unit.id); setEditForm({ unitNumber: unit.unitNumber, rentAmount: unit.rentAmount, status: unit.status }); }}
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
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${property.type === "Rent" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
            {property.type}
          </span>
          <span className="text-sm font-semibold text-gray-700">${Number(property.price).toLocaleString()}/mo</span>
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
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>{property.beds} bed</span>
            <span>{property.baths} bath</span>
            <span>{Number(property.sqft).toLocaleString()} sqft</span>
          </div>
          <UnitsManager propertyId={property.id} />
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
    if (window.confirm("Delete this property? This cannot be undone.")) {
      await deleteMutation.mutateAsync(id);
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
