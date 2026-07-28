import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut, LayoutDashboard, CreditCard, Wrench, FileText, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";

const menuItems = [
  { path: "/tenant", label: "Dashboard", icon: LayoutDashboard },
  { path: "/tenant/payments", label: "Payments & Invoices", icon: CreditCard },
  { path: "/tenant/maintenance", label: "Maintenance", icon: Wrench },
  { path: "/tenant/documents", label: "Documents", icon: FileText },
  { path: "/tenant/settings", label: "Account Settings", icon: Settings },
];

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();
  const { data: user, isLoading: authLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { window.location.href = "/login"; return; }
    if (user.role !== "tenant") { window.location.href = "/login"; }
  }, [user, authLoading]);

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
    </div>
  );
  if (!user || user.role !== "tenant") return null;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync().catch(() => {});
    window.location.href = "/login";
  };

  const isActive = (path: string) =>
    path === "/tenant" ? location === "/tenant" : location.startsWith(path);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#0A1628] text-white transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-[#C9A84C]">Luxe Portal</h1>
              <p className="text-xs text-gray-400">Tenant</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} href={path}>
              <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${
                isActive(path)
                  ? "bg-[#C9A84C] text-[#0A1628] font-semibold"
                  : "text-gray-300 hover:bg-white/10"
              }`}>
                <Icon size={18} />
                {sidebarOpen && <span>{label}</span>}
              </a>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-xs text-gray-400">Logged in as</p>
              <p className="text-sm font-semibold text-white truncate">{user.name || user.email}</p>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition">
            <LogOut size={16} />
            {sidebarOpen && "Sign Out"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <h2 className="text-xl font-bold text-[#0A1628]">
            {menuItems.find(m => isActive(m.path))?.label || "Tenant Portal"}
          </h2>
        </div>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
