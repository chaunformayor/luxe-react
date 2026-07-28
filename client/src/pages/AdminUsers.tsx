import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Shield, Home, User, UserPlus, X, Copy, Check,
  FlaskConical, Mail, Edit2, Key, UserCheck,
} from "lucide-react";

const ROLES = ["admin", "owner", "tenant", "user"] as const;
type Role = (typeof ROLES)[number];

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";

// ─── Create User Modal ─────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("owner");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const createUser = trpc.admin.createUserAccount.useMutation({
    onSuccess: (data) => { setCreated({ tempPassword: data.tempPassword }); onSuccess(); },
    onError: (e) => setError(e.message),
  });

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
              {role === "owner" ? " A welcome email has been sent." : " Share the temporary password below."}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Temporary Password</label>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm text-gray-800 select-all">
                  {created.tempPassword}
                </div>
                <button onClick={copyPassword} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">User will be required to change this on first login.</p>
            </div>
            <button onClick={onClose} className="w-full py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90">
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
        <form className="p-5 space-y-4" onSubmit={(e) => { e.preventDefault(); setError(null); createUser.mutate({ name, email, role }); }}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Full Name *</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email Address *</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@email.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Role *</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)} className={inputCls}>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
              <option value="user">User</option>
            </select>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            {role === "owner"
              ? "A welcome email with login credentials will be sent to the owner."
              : "A temporary password will be generated. Copy it after creation to share with the user."}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createUser.isPending} className="flex-1 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 disabled:opacity-50">
              {createUser.isPending ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit User Modal ───────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSuccess }: { user: any; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [role, setRole] = useState<Role>(user.role ?? "user");
  const [resetPw, setResetPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ tempPassword?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const updateUser = trpc.admin.updateUser.useMutation({
    onSuccess: (data) => { setResult(data); onSuccess(); },
    onError: (e) => setError(e.message),
  });

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1628]">User Updated</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              Changes saved for <strong>{name}</strong>.
            </div>
            {result.tempPassword && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">New Temporary Password</label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm text-gray-800 select-all">
                    {result.tempPassword}
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(result.tempPassword!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Share this with the user — they'll be required to change it on login.</p>
              </div>
            )}
            <button onClick={onClose} className="w-full py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90">
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
            <h2 className="text-lg font-bold text-[#0A1628]">Edit User</h2>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form className="p-5 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          updateUser.mutate({ id: user.id, name, email, role, resetPassword: resetPw || undefined });
        }}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Full Name *</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email Address *</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Role *</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)} className={inputCls}>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
              <option value="user">User</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={resetPw} onChange={e => setResetPw(e.target.checked)} className="w-4 h-4 accent-[#C9A84C]" />
            <span className="text-sm text-gray-700 font-medium">Reset password (generate new temporary password)</span>
          </label>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={updateUser.isPending} className="flex-1 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 disabled:opacity-50">
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Assign Tenant Modal ───────────────────────────────────────────────────────
function AssignTenantModal({ user, onClose, onSuccess }: { user: any; onClose: () => void; onSuccess: () => void }) {
  const { data: units = [] } = trpc.admin.getAllUnitsAdmin.useQuery();
  const [unitId, setUnitId] = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const createRecord = trpc.admin.createTenantRecord.useMutation({
    onSuccess: () => { setDone(true); onSuccess(); },
    onError: (e) => setError(e.message),
  });

  const vacantUnits = (units as any[]).filter((u: any) => u.status === "vacant" || u.status == null);

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <UserCheck size={24} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-[#0A1628]">Tenant Assigned</h2>
          <p className="text-sm text-gray-500">
            <strong>{user.name}</strong> has been linked to the unit and their role set to "Tenant".
          </p>
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
            <h2 className="text-lg font-bold text-[#0A1628]">Assign to Unit</h2>
            <p className="text-sm text-gray-500 mt-0.5">Link {user.name} to a unit as a tenant</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form className="p-5 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (!unitId || !leaseStart || !leaseEnd) { setError("All fields are required."); return; }
          createRecord.mutate({ userId: user.id, unitId, leaseStartDate: leaseStart, leaseEndDate: leaseEnd });
        }}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Unit *</label>
            <select value={unitId} onChange={e => setUnitId(e.target.value)} required className={inputCls}>
              <option value="">— Select a vacant unit —</option>
              {vacantUnits.map((u: any) => (
                <option key={u.id} value={u.id}>
                  Unit {u.unitNumber} — {u.propertyName} (${Number(u.rentAmount).toLocaleString()}/mo)
                </option>
              ))}
            </select>
            {vacantUnits.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No vacant units found. Add units to a property first.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Lease Start *</label>
              <input required type="date" value={leaseStart} onChange={e => setLeaseStart(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Lease End *</label>
              <input required type="date" value={leaseEnd} onChange={e => setLeaseEnd(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            This will set {user.name}'s role to <strong>Tenant</strong> and mark the unit as occupied.
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createRecord.isPending} className="flex-1 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 disabled:opacity-50">
              {createRecord.isPending ? "Assigning..." : "Assign Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Seed Result Modal ─────────────────────────────────────────────────────────
function SeedResult({ result, onClose }: { result: any; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copyAll = () => {
    const text = Object.entries(result).map(([role, info]: any) =>
      `${role.toUpperCase()}\nEmail: ${info.email}\nPassword: ${info.password}`
    ).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0A1628]">Test Accounts Ready</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-3">
          {Object.entries(result).map(([role, info]: any) => (
            <div key={role} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-2">{role}</p>
              <p className="text-sm text-gray-700"><span className="font-medium">Email:</span> {info.email}</p>
              <p className="text-sm text-gray-700"><span className="font-medium">Password:</span> <span className="font-mono">{info.password}</span></p>
              {!info.created && <p className="text-xs text-amber-600 mt-1">Account already existed — password unchanged</p>}
            </div>
          ))}
          <button onClick={copyAll} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
            {copied ? <><Check size={14} className="text-green-600" /> Copied!</> : <><Copy size={14} /> Copy All Credentials</>}
          </button>
          <button onClick={onClose} className="w-full py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90">Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Test Email Modal ──────────────────────────────────────────────────────────
function TestEmailModal({ onClose }: { onClose: () => void }) {
  const [to, setTo] = React.useState("");
  const [result, setResult] = React.useState<any>(null);
  const testMutation = trpc.admin.testEmail.useMutation({
    onSuccess: (data) => setResult(data),
    onError: (e) => setResult({ error: e.message }),
  });
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Send Test Email</h2>
            <p className="text-sm text-gray-500 mt-0.5">Verify Maileroo is configured correctly</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          {!result ? (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Send test to</label>
                <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="your@email.com" className={inputCls} />
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => testMutation.mutate({ to })} disabled={!to || testMutation.isPending}
                  className="flex-1 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 disabled:opacity-50">
                  {testMutation.isPending ? "Sending..." : "Send Test"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={`rounded-lg p-4 text-sm space-y-2 ${result.error || result.responseBody?.success === false ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                <p className={`font-bold ${result.error || result.responseBody?.success === false ? "text-red-700" : "text-green-700"}`}>
                  {result.error || result.responseBody?.success === false ? "Failed" : "Sent successfully"}
                </p>
                <p className="text-gray-700"><span className="font-medium">API key set:</span> {result.apiKeySet ? "Yes" : "No — add MAILEROO_API_KEY to Vercel env vars"}</p>
                <p className="text-gray-700"><span className="font-medium">From:</span> {result.fromEmail}</p>
                <p className="text-gray-700"><span className="font-medium">To:</span> {result.to}</p>
                {result.httpStatus && <p className="text-gray-700"><span className="font-medium">HTTP status:</span> {result.httpStatus}</p>}
                {result.responseBody && <pre className="text-xs bg-white/70 rounded p-2 overflow-x-auto mt-2">{JSON.stringify(result.responseBody, null, 2)}</pre>}
                {result.error && <p className="text-red-600 font-mono text-xs mt-1">{result.error}</p>}
              </div>
              <button onClick={onClose} className="w-full py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90">Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.getAllUsers.useQuery();
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [showTestEmail, setShowTestEmail] = useState(false);

  const seedMutation = trpc.admin.seedTestAccounts.useMutation({
    onSuccess: (data) => { setSeedResult(data); utils.admin.getAllUsers.invalidate(); },
    onError: (e) => alert(`Seed failed: ${e.message}`),
  });

  const filteredUsers = users?.filter((user: any) =>
    filterRole === "all" ? true : user.role === filterRole
  ) || [];

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    owner: "bg-blue-100 text-blue-800",
    tenant: "bg-green-100 text-green-800",
    user: "bg-gray-100 text-gray-800",
  };
  const roleIcons: Record<string, any> = { admin: Shield, owner: Home, tenant: User, user: User };

  const stats = {
    total: users?.length || 0,
    admins: users?.filter((u: any) => u.role === "admin").length || 0,
    owners: users?.filter((u: any) => u.role === "owner").length || 0,
    tenants: users?.filter((u: any) => u.role === "tenant").length || 0,
  };

  const invalidate = () => utils.admin.getAllUsers.invalidate();

  return (
    <AdminLayout>
      {showCreateUser && <CreateUserModal onClose={() => setShowCreateUser(false)} onSuccess={invalidate} />}
      {editTarget && <EditUserModal user={editTarget} onClose={() => setEditTarget(null)} onSuccess={invalidate} />}
      {assignTarget && <AssignTenantModal user={assignTarget} onClose={() => setAssignTarget(null)} onSuccess={invalidate} />}
      {seedResult && <SeedResult result={seedResult} onClose={() => setSeedResult(null)} />}
      {showTestEmail && <TestEmailModal onClose={() => setShowTestEmail(false)} />}

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowTestEmail(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition" title="Send a test email">
              <Mail size={16} /> Test Email
            </button>
            <button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition disabled:opacity-50">
              <FlaskConical size={16} /> {seedMutation.isPending ? "Seeding..." : "Seed Test Accounts"}
            </button>
            <button onClick={() => setShowCreateUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-semibold hover:bg-[#0A1628]/90 transition">
              <UserPlus size={16} /> Create User
            </button>
            <div className="flex gap-1">
              {["all", "admin", "owner", "tenant"].map((r) => (
                <button key={r} onClick={() => setFilterRole(r)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filterRole === r ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
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
                      {["Name", "Email", "Role", "Login Method", "Last Signed In", "Created", "Actions"].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{h}</th>
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
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditTarget(user)} title="Edit user"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                <Edit2 size={15} />
                              </button>
                              <button onClick={() => setAssignTarget(user)} title="Assign to unit as tenant"
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition">
                                <UserCheck size={15} />
                              </button>
                              <button onClick={() => { setEditTarget({ ...user, _resetOnly: true }); }} title="Reset password"
                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition">
                                <Key size={15} />
                              </button>
                            </div>
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
