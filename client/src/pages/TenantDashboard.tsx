import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CreditCard, Wrench, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";

function ForceChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to change password.");
        return;
      }
      window.location.reload();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors";

  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0A1628] mb-4">
              <KeyRound className="text-[#C9A84C]" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Create Your Password</h1>
            <p className="text-gray-500 mt-2 text-sm">
              You logged in with a temporary password. Please set a new password to continue.
            </p>
          </div>

          <Card className="border-[#C9A84C]/20">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className={inputCls + " pr-12"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Confirm Password
                  </label>
                  <input
                    required
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className={inputCls}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C9A84C] text-[#0A1628] font-bold text-sm uppercase tracking-wide rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
                >
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

export default function TenantDashboard() {
  const { data: stats, isLoading } = trpc.tenant.getStats.useQuery();
  const { data: tenant } = trpc.tenant.getTenantInfo.useQuery();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();

  if (userLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-8 w-48" />
        </div>
      </AdminLayout>
    );
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

  if ((user as any)?.mustChangePassword) {
    return <ForceChangePassword />;
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="hover:shadow-lg transition">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name || "Tenant"}!</h1>
          <p className="text-purple-100">
            {tenant ? `Unit: ${tenant.unitId}` : "Manage your lease, payments, and maintenance requests."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Invoices" value={stats?.totalInvoices || 0} icon={FileText} color="text-blue-500" />
          <StatCard title="Payments" value={stats?.totalPayments || 0} icon={CreditCard} color="text-green-500" />
          <StatCard title="Maintenance Requests" value={stats?.totalMaintenanceRequests || 0} icon={Wrench} color="text-orange-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">View your payment history and invoices</p>
                <a href="/tenant/payments" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  View Payments
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Maintenance Requests</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Submit and track maintenance requests</p>
                <a href="/tenant/maintenance" className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                  View Requests
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Lease Information</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {tenant?.leaseStartDate
                    ? `Lease Start: ${new Date(tenant.leaseStartDate).toLocaleDateString()}`
                    : "No lease information available"}
                </p>
                <p className="text-sm text-gray-600">
                  {tenant?.leaseEndDate
                    ? `Lease End: ${new Date(tenant.leaseEndDate).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Access your lease and other documents</p>
                <a href="/tenant/documents" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  View Documents
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
