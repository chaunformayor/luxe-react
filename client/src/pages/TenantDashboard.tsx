import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CreditCard, Wrench, AlertCircle, KeyRound, Eye, EyeOff, Home, Calendar, DollarSign, Clock } from "lucide-react";

function ForceChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls = "w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed."); return; }
      window.location.reload();
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0A1628] mb-4">
              <KeyRound className="text-[#C9A84C]" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Create Your Password</h1>
            <p className="text-gray-500 mt-2 text-sm">Set a new password to access your tenant portal.</p>
          </div>
          <Card className="border-[#C9A84C]/20">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">New Password</label>
                  <div className="relative">
                    <input required type={showPw ? "text" : "password"} value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters"
                      className={inputCls + " pr-12"} />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Confirm Password</label>
                  <input required type={showPw ? "text" : "password"} value={confirm}
                    onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" className={inputCls} />
                </div>
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#C9A84C] text-[#0A1628] font-bold text-sm uppercase tracking-wide rounded-lg hover:bg-[#C9A84C]/90 disabled:opacity-50">
                  {loading ? "Saving..." : "Set Password & Continue"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function LeaseCard({ lease }: { lease: any }) {
  const daysUntilExpiry = lease?.leaseEndDate
    ? Math.ceil((new Date(lease.leaseEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const expiryColor = daysUntilExpiry === null ? "text-gray-500"
    : daysUntilExpiry <= 30 ? "text-red-600"
    : daysUntilExpiry <= 90 ? "text-amber-600"
    : "text-green-600";

  return (
    <Card className="border-[#C9A84C]/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#0A1628]">
          <Home size={18} className="text-[#C9A84C]" /> Lease Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!lease ? (
          <p className="text-sm text-gray-500">No lease information on file. Contact your property manager.</p>
        ) : (
          <div className="space-y-3">
            <div className="bg-[#0A1628]/5 rounded-lg p-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Unit</p>
              <p className="font-semibold text-[#0A1628]">
                {lease.unitNumber ? `Unit ${lease.unitNumber}` : "—"}
              </p>
              {lease.propertyAddress && (
                <p className="text-sm text-gray-600 mt-0.5">
                  {lease.propertyAddress}{lease.propertyCity ? `, ${lease.propertyCity}` : ""}{lease.propertyState ? `, ${lease.propertyState}` : ""}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Monthly Rent</p>
                <p className="font-semibold text-[#0A1628]">
                  {lease.rentAmount ? `$${parseFloat(lease.rentAmount).toLocaleString()}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  lease.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {lease.status ? lease.status.charAt(0).toUpperCase() + lease.status.slice(1) : "—"}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Lease Start</p>
                <p className="text-sm text-gray-700">
                  {lease.leaseStartDate ? new Date(lease.leaseStartDate).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Lease End</p>
                <p className="text-sm text-gray-700">
                  {lease.leaseEndDate ? new Date(lease.leaseEndDate).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
            {daysUntilExpiry !== null && (
              <div className={`flex items-center gap-2 text-sm font-medium ${expiryColor}`}>
                <Clock size={14} />
                {daysUntilExpiry > 0
                  ? `${daysUntilExpiry} days until lease expires`
                  : "Lease has expired — contact your property manager"}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TenantDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.tenant.getStats.useQuery();
  const { data: lease, isLoading: leaseLoading } = trpc.tenant.getLease.useQuery();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();

  if (userLoading) {
    return <AdminLayout><div className="flex items-center justify-center h-64"><Skeleton className="h-8 w-48" /></div></AdminLayout>;
  }

  if (user && user.role !== "tenant" && user.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600">You do not have permission to access the tenant portal.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if ((user as any)?.mustChangePassword) return <ForceChangePassword />;

  const StatCard = ({ title, value, icon: Icon, color, href }: any) => (
    <a href={href}>
      <Card className="hover:shadow-lg transition hover:border-[#C9A84C]/40 cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          {statsLoading ? <Skeleton className="h-8 w-24" /> : (
            <div className="text-2xl font-bold text-[#0A1628]">{value}</div>
          )}
        </CardContent>
      </Card>
    </a>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-[#0A1628] to-[#0A1628]/80 text-white p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Welcome, {user?.name || "Tenant"}!</h1>
              <p className="text-[#C9A84C]/80 text-sm">
                {lease?.propertyName
                  ? `${lease.propertyName}${lease.unitNumber ? ` · Unit ${lease.unitNumber}` : ""}`
                  : "Tenant Portal"}
              </p>
            </div>
            {lease?.rentAmount && (
              <div className="text-right">
                <p className="text-[#C9A84C] text-xs uppercase tracking-widest font-bold">Monthly Rent</p>
                <p className="text-2xl font-bold">${parseFloat(lease.rentAmount).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Invoices" value={stats?.totalInvoices ?? 0} icon={FileText} color="text-[#C9A84C]" href="/tenant/payments" />
          <StatCard title="Payments Made" value={stats?.totalPayments ?? 0} icon={CreditCard} color="text-green-600" href="/tenant/payments" />
          <StatCard title="Maintenance Requests" value={stats?.totalMaintenanceRequests ?? 0} icon={Wrench} color="text-blue-600" href="/tenant/maintenance" />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lease details */}
          {leaseLoading ? (
            <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
          ) : (
            <LeaseCard lease={lease} />
          )}

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="hover:shadow-md transition">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                    <Wrench size={18} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1628]">Submit Maintenance Request</p>
                    <p className="text-sm text-gray-500">Report an issue with your unit</p>
                  </div>
                </div>
                <a href="/tenant/maintenance"
                  className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-lg hover:bg-[#0A1628]/90 transition whitespace-nowrap">
                  Go →
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                    <CreditCard size={18} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1628]">Payment History</p>
                    <p className="text-sm text-gray-500">View invoices and past payments</p>
                  </div>
                </div>
                <a href="/tenant/payments"
                  className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-lg hover:bg-[#0A1628]/90 transition whitespace-nowrap">
                  Go →
                </a>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                    <FileText size={18} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1628]">Documents</p>
                    <p className="text-sm text-gray-500">Lease agreements and records</p>
                  </div>
                </div>
                <a href="/tenant/documents"
                  className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-lg hover:bg-[#0A1628]/90 transition whitespace-nowrap">
                  Go →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
