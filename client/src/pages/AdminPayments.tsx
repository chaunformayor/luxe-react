import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, TrendingUp, FileText, Plus, X, Check, AlertCircle } from "lucide-react";

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";

// ─── Create Invoice Modal ──────────────────────────────────────────────────────
function CreateInvoiceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { data: tenants = [] } = trpc.admin.getAllTenants.useQuery();
  const { data: users = [] } = trpc.admin.getAllUsers.useQuery();

  const [tenantId, setTenantId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const createInvoice = trpc.admin.createInvoice.useMutation({
    onSuccess: () => { setDone(true); onSuccess(); },
    onError: (e) => setError(e.message),
  });

  // Build tenant display list by joining tenants + users
  const tenantOptions = (tenants as any[]).map((t: any) => {
    const user = (users as any[]).find((u: any) => u.id === t.userId);
    return { ...t, userName: user?.name ?? "Unknown", userEmail: user?.email ?? "" };
  });

  const selectedTenant = tenantOptions.find((t: any) => t.id === tenantId);

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check size={24} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-[#0A1628]">Invoice Created</h2>
          <p className="text-sm text-gray-500">The invoice has been sent to the tenant.</p>
          <button onClick={onClose} className="w-full py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Create Invoice</h2>
            <p className="text-sm text-gray-500 mt-0.5">Bill a tenant for rent or other charges</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form className="p-5 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (!selectedTenant?.unitId) { setError("Selected tenant has no unit assigned. Assign them to a unit first."); return; }
          createInvoice.mutate({
            tenantId,
            unitId: selectedTenant.unitId,
            amount,
            dueDate,
            description: description || undefined,
          });
        }}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Tenant *</label>
            <select value={tenantId} onChange={e => setTenantId(e.target.value)} required className={inputCls}>
              <option value="">— Select tenant —</option>
              {tenantOptions.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.userName} ({t.userEmail})
                </option>
              ))}
            </select>
            {tenantOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No tenants found. Create a user with role "Tenant" and assign them to a unit first.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Amount ($) *</label>
              <input required type="number" min="0.01" step="0.01" value={amount}
                onChange={e => setAmount(e.target.value)} placeholder="1200.00" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Due Date *</label>
              <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. August 2026 Rent" className={inputCls} />
          </div>

          {selectedTenant && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              Invoice will be created with status <strong>Sent</strong> — visible to the tenant in their portal.
            </div>
          )}

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createInvoice.isPending} className="flex-1 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 disabled:opacity-50">
              {createInvoice.isPending ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPayments() {
  const utils = trpc.useUtils();
  const { data: payments, isLoading: paymentsLoading } = trpc.admin.getAllPayments.useQuery();
  const { data: invoices, isLoading: invoicesLoading } = trpc.admin.getAllInvoices.useQuery();
  const [tab, setTab] = useState<"invoices" | "payments">("invoices");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);

  const markReceived = trpc.admin.markPaymentReceived.useMutation({
    onSuccess: () => utils.admin.getAllPayments.invalidate(),
    onError: (e) => alert(`Failed: ${e.message}`),
  });

  const filteredPayments = (payments as any[] ?? []).filter((p: any) =>
    filterStatus === "all" ? true : p.status === filterStatus
  );

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800",
  };

  const invoiceStatusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-500",
  };

  const totalRevenue = (payments as any[] ?? []).reduce((sum: number, p: any) =>
    p.status === "completed" ? sum + parseFloat(p.amount) : sum, 0);

  const pendingInvoices = (invoices as any[] ?? []).filter((i: any) => i.status === "sent" || i.status === "overdue").length;

  return (
    <AdminLayout>
      {showCreate && (
        <CreateInvoiceModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { utils.admin.getAllInvoices.invalidate(); setShowCreate(false); }}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Payments & Invoices</h1>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-semibold hover:bg-[#0A1628]/90 transition">
            <Plus size={16} /> Create Invoice
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-gray-500 mt-1">From completed payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Open Invoices</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{pendingInvoices}</div>
              <p className="text-xs text-gray-500 mt-1">Sent or overdue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{(invoices as any[])?.length ?? 0}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {(["invoices", "payments"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
                tab === t ? "border-[#C9A84C] text-[#0A1628]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t === "invoices" ? "Invoices" : "Payment History"}
            </button>
          ))}
        </div>

        {/* Invoices Tab */}
        {tab === "invoices" && (
          <Card>
            <CardHeader>
              <CardTitle>All Invoices ({(invoices as any[])?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (invoices as any[])?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {["Tenant ID", "Amount", "Due Date", "Status", "Description", "Created"].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(invoices as any[]).map((inv: any) => (
                        <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-600 text-sm font-mono">{inv.tenantId.slice(0, 12)}…</td>
                          <td className="py-3 px-4 text-gray-900 font-semibold">
                            ${parseFloat(inv.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoiceStatusColors[inv.status] ?? invoiceStatusColors.draft}`}>
                              {inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{inv.description ?? "—"}</td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto mb-3 text-gray-300" size={40} />
                  <p className="text-gray-500 font-medium">No invoices yet</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Create Invoice" to bill a tenant.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payments Tab */}
        {tab === "payments" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment History ({filteredPayments.length})</CardTitle>
              <div className="flex gap-1">
                {["all", "pending", "completed", "failed"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : filteredPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {["User ID", "Amount", "Method", "Status", "Due Date", "Paid Date", ""].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment: any) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-600 text-sm font-mono">{payment.userId?.slice(0, 12)}…</td>
                          <td className="py-3 px-4 text-gray-900 font-semibold">
                            ${parseFloat(payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm capitalize">{payment.paymentMethod?.replace("_", " ")}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[payment.status] ?? statusColors.pending}`}>
                              {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4">
                            {payment.status === "pending" && (
                              <button
                                onClick={() => { if (window.confirm("Mark this payment as received/completed?")) markReceived.mutate(payment.id); }}
                                disabled={markReceived.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50">
                                <Check size={12} /> Mark Received
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-500">No payments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
