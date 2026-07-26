import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, Home, User } from "lucide-react";

export default function AdminUsers() {
  const { data: users, isLoading } = trpc.admin.getAllUsers.useQuery();
  const [filterRole, setFilterRole] = useState<string>("all");

  const filteredUsers = users?.filter((user: any) =>
    filterRole === "all" ? true : user.role === filterRole
  ) || [];

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    owner: "bg-blue-100 text-blue-800",
    tenant: "bg-green-100 text-green-800",
    user: "bg-gray-100 text-gray-800",
  };

  const roleIcons: Record<string, any> = {
    admin: Shield,
    owner: Home,
    tenant: User,
    user: User,
  };

  const stats = {
    total: users?.length || 0,
    admins: users?.filter((u: any) => u.role === "admin").length || 0,
    owners: users?.filter((u: any) => u.role === "owner").length || 0,
    tenants: users?.filter((u: any) => u.role === "tenant").length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <div className="flex gap-2">
            {["all", "admin", "owner", "tenant", "user"].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterRole === role
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.admins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Owners</CardTitle>
              <Home className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.owners}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tenants</CardTitle>
              <User className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.tenants}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Login Method</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Signed In</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: any) => {
                      const RoleIcon = roleIcons[user.role] || User;
                      return (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium">{user.name || "N/A"}</td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{user.email || "N/A"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                roleColors[user.role] || roleColors.user
                              }`}
                            >
                              <RoleIcon size={12} />
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {user.loginMethod || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {user.lastSignedIn
                              ? new Date(user.lastSignedIn).toLocaleDateString()
                              : "Never"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
