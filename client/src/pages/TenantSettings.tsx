import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import TenantLayout from "@/components/TenantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Check, User, KeyRound } from "lucide-react";

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";

function ProfileSection({ user }: { user: any }) {
  const utils = trpc.useUtils();
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = trpc.tenant.updateProfile.useMutation({
    onSuccess: () => {
      setSaved(true);
      utils.auth.me.invalidate();
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (e) => setError(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0A1628]">
          <User size={18} className="text-[#C9A84C]" /> Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4 max-w-md"
          onSubmit={(e) => { e.preventDefault(); setError(null); updateProfile.mutate({ name }); }}
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
            <input type="text" value={user?.email ?? ""} disabled className={inputCls + " bg-gray-50 text-gray-400 cursor-not-allowed"} />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here — contact your property manager.</p>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 disabled:opacity-50 transition"
          >
            {saved ? <><Check size={15} /> Saved!</> : updateProfile.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordSection() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = trpc.tenant.changePassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setCurrent(""); setNewPw(""); setConfirm("");
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPw !== confirm) { setError("New passwords do not match."); return; }
    if (newPw.length < 8) { setError("Password must be at least 8 characters."); return; }
    changePassword.mutate({ currentPassword: current, newPassword: newPw });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0A1628]">
          <KeyRound size={18} className="text-[#C9A84C]" /> Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4 max-w-md" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                required type={showPw ? "text" : "password"}
                value={current} onChange={e => setCurrent(e.target.value)}
                placeholder="Your current password"
                className={inputCls + " pr-10"}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">New Password</label>
            <input
              required type={showPw ? "text" : "password"}
              value={newPw} onChange={e => setNewPw(e.target.value)}
              placeholder="At least 8 characters"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Confirm New Password</label>
            <input
              required type={showPw ? "text" : "password"}
              value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              className={inputCls}
            />
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
              <Check size={15} /> Password changed successfully.
            </div>
          )}
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="px-5 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 disabled:opacity-50 transition"
          >
            {changePassword.isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function TenantSettings() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  return (
    <TenantLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-[#0A1628]">Account Settings</h1>
        {isLoading ? (
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <ProfileSection user={user} />
        )}
        <ChangePasswordSection />
      </div>
    </TenantLayout>
  );
}
