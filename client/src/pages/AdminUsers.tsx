import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, Home, User, UserPlus, X, Copy, Check } from "lucide-react";

const ROLES = ["admin", "owner", "tenant", "user"] as const;
type Role = (typeof ROLES)[number];

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("owner");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const createUser = trpc.admin.createUserAccount.useMutation({
    onSuccess: (data) => {
      setCreated({ tempPassword: data.tempPassword });
      onSuccess();
    },
    onError: (e) => setError(e.message),
  });

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";

  const copyPassword = () => {
    if (created) {
      navigator.clipboard.writeText(created.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (created) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1628]">Account Created</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              Account created for <strong>{name}</strong> ({role}).
              {role === "owner" ? " A welcome email has been sent with login instructions." : " Share the temporary password below with the user."}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Temporary Password</label>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm text-gray-800 select-all">
                  {created.tempPassword}
                </div>
                <button onClick={copyPassword}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">User will be required to change this on first login.</p>
            </div>
            <button onClick={onClose}
              className="w-full py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Create User Account</h2>
            <p className="text-sm text-gray-500 mt-0.5">User will set a new password on first login</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form
          className="p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            createUser.mutate({ name, email, role });
          }}
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="John Smith" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="user@email.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Role <span className="text-red-500">*</span>
            </label>
            <select value={role} onChange={e => setRole(e.target.value as Role)} className={inputCls}>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
              <option value="user">User</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            {role === "owner"
              ? "A welcome email with login credentials will be sent to the owner."
              : "A temporary password will be generated. Copy it after creation to share with the user."}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={createUser.isPending}
              className="flex-1 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 disabled:opacity-50">
              {createUser.isPending ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.getAllUsers.useQuery();
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showCreateUser, setShowCreateUser] = useState(false);

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
      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onSuccess={() => utils.admin.getAllUsers.invalidate()}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-semibold hover:bg-[#0A1628]/90 transition"
            >
              <UserPlus size={16} /> Create User
            </button>
            <div className="flex gap-1">
              {["all", "admin", "owner", "tenant"].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    filterRole === r ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.total, Icon: Users, color: "text-blue-500" },
            { label: "Admins", value: stats.admins, Icon: Shield, color: "text-red-500" },
            { label: "Owners", value: stats.owners, Icon: Home, color: "text-blue-500" },
            { label: "Tenants", value: stats.tenants, Icon: User, color: "text-green-500" },
          ].map(({ label, value, Icon, color }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {["Name", "Email", "Role", "Login Method", "Last Signed In", "Created"].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-semibold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: any) => {
                      const RoleIcon = roleIcons[user.role] || User;
                      return (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            {user.name || "N/A"}
                            {user.mustChangePassword && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">temp pw</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{user.email || "N/A"}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.user}`}>
                              <RoleIcon size={12} />
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{user.loginMethod || "N/A"}</td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : "Never"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
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
