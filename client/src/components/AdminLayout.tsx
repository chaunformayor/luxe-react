import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut, BarChart3, Building2, MessageSquare, Wrench, CreditCard, Users, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setIsSidebarOpen] = useState(true);
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const { data: user } = trpc.auth.me.useQuery();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const isActive = (path: string) => location === path;

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: BarChart3 },
    { path: "/admin/properties", label: "Properties", icon: Building2 },
    { path: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
    { path: "/admin/maintenance", label: "Maintenance", icon: Wrench },
    { path: "/admin/payments", label: "Payments", icon: CreditCard },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/applications", label: "Applications", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-yellow-500">Luxe Admin</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? "bg-yellow-500 text-gray-900 font-semibold"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-sm font-semibold truncate">{user?.name || "Admin"}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <LogOut size={16} className="mr-2" />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">
            {menuItems.find((item) => isActive(item.path))?.label || "Dashboard"}
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
