import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import OwnerLayout from "@/components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, DollarSign, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";

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
    <OwnerLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0A1628] mb-4">
              <KeyRound className="text-[#C9A84C]" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Create Your Password</h1>
            <p className="text-gray-500 mt-2 text-sm">Set a new password to access your owner portal.</p>
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
    </OwnerLayout>
  );
}

export default function OwnerDashboard() {
  const { data: stats, isLoading } = trpc.owner.getStats.useQuery();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();

  if (userLoading) {
    return <OwnerLayout><div className="flex items-center justify-center h-64"><Skeleton className="h-8 w-48" /></div></OwnerLayout>;
  }

  if (user && user.role !== "owner" && user.role !== "admin") {
    return (
      <OwnerLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600">You do not have permission to access the owner portal.</p>
          </div>
        </div>
      </OwnerLayout>
    );
  }

  if ((user as any)?.mustChangePassword) return <ForceChangePassword />;

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
    <OwnerLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name || "Owner"}!</h1>
          <p className="text-green-100">Manage your properties, tenants, and view financial reports.</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Properties"
            value={stats?.totalProperties || 0}
            icon={Building2}
            color="text-blue-500"
          />
          <StatCard
            title="Active Tenants"
            value={stats?.totalTenants || 0}
            icon={Users}
            color="text-green-500"
          />
          <StatCard
            title="Pending Maintenance"
            value={stats?.pendingMaintenance || 0}
            icon={AlertCircle}
            color="text-orange-500"
          />
          <StatCard
            title="Total Revenue"
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="text-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Your Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">View and manage all your properties</p>
                <a
                  href="/owner/properties"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Properties
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Management */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Manage tenants across your properties</p>
                <a
                  href="/owner/tenants"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  View Tenants
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Financial Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">View payments, invoices, and revenue</p>
                <a
                  href="/owner/payments"
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  View Payments
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Track maintenance requests and work orders</p>
                <a
                  href="/owner/maintenance"
                  className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  View Maintenance
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Owner Portal Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Welcome to your owner portal!</strong> From here you can manage all your properties,
                track tenants, view financial reports, and monitor maintenance requests. Use the sidebar
                navigation to access different sections of your portal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OwnerLayout>
  );
}
