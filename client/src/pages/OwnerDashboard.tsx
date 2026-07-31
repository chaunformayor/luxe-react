import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import OwnerLayout from "@/components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, DollarSign, AlertCircle, KeyRound, Eye, EyeOff, ArrowRight } from "lucide-react";

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

const quickLinks = [
  { label: "My Properties", desc: "View and manage your properties", href: "/owner/properties", icon: Building2 },
  { label: "Tenants", desc: "Manage tenants across your properties", href: "/owner/tenants", icon: Users },
  { label: "Payments", desc: "View invoices and revenue", href: "/owner/payments", icon: DollarSign },
  { label: "Maintenance", desc: "Track open work orders", href: "/owner/maintenance", icon: AlertCircle },
];

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

  const statCards = [
    { title: "My Properties", value: stats?.totalProperties ?? 0, icon: Building2 },
    { title: "Active Tenants", value: stats?.totalTenants ?? 0, icon: Users },
    { title: "Open Maintenance", value: stats?.pendingMaintenance ?? 0, icon: AlertCircle },
    { title: "Total Revenue", value: `$${Number(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign },
  ];

  return (
    <OwnerLayout>
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="bg-[#0A1628] text-white p-6 rounded-xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || "Owner"}</h1>
            <p className="text-[#C9A84C]/80 text-sm mt-1">Here's an overview of your portfolio.</p>
          </div>
          <div className="hidden md:block w-12 h-12 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
            <Building2 className="text-[#C9A84C]" size={24} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ title, value, icon: Icon }) => (
            <Card key={title} className="hover:shadow-md transition border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-[#0A1628]/5 flex items-center justify-center">
                  <Icon size={16} className="text-[#C9A84C]" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-[#0A1628]">{value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map(({ label, desc, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-[#C9A84C] hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0 group-hover:bg-[#C9A84C] transition">
                <Icon size={20} className="text-[#C9A84C] group-hover:text-[#0A1628] transition" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0A1628] text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-[#C9A84C] transition shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </OwnerLayout>
  );
}
