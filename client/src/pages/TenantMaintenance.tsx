import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, Plus, X } from "lucide-react";

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

function NewRequestModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ title: "", description: "", priority: "medium" as const });
  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.tenant.createMaintenanceRequest.useMutation({
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e) => setError(e.message),
  });

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-[#0A1628]">Submit Maintenance Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form
          className="p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            createMutation.mutate(formData);
          }}
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Issue Title <span className="text-red-500">*</span></label>
            <input required type="text" value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Leaky faucet in kitchen" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea required value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the issue in detail..." rows={4} className={inputCls + " resize-none"} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Priority</label>
            <select value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
              className={inputCls}>
              <option value="low">Low — Minor issue, no urgency</option>
              <option value="medium">Medium — Needs attention soon</option>
              <option value="high">High — Affecting daily life</option>
              <option value="urgent">Urgent — Safety or major damage</option>
            </select>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-bold hover:bg-[#0A1628]/90 disabled:opacity-50">
              {createMutation.isPending ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TenantMaintenance() {
  const utils = trpc.useUtils();
  const { data: requests, isLoading } = trpc.tenant.getMaintenanceRequests.useQuery();
  const [showForm, setShowForm] = useState(false);

  return (
    <AdminLayout>
      {showForm && (
        <NewRequestModal
          onClose={() => setShowForm(false)}
          onSuccess={() => utils.tenant.getMaintenanceRequests.invalidate()}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0A1628]">Maintenance Requests</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-semibold hover:bg-[#0A1628]/90 transition"
          >
            <Plus size={16} /> Submit Request
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Requests ({requests?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
            ) : requests && requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map((req: any) => (
                  <div key={req.id} className="p-4 border border-gray-200 rounded-lg hover:border-[#C9A84C]/40 transition">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0A1628] truncate">{req.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{req.description}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[req.status] || statusColors.open}`}>
                          {req.status.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[req.priority] || priorityColors.medium}`}>
                          {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                      <span>{req.assignedTo ? `Assigned to: ${req.assignedTo}` : "Awaiting assignment"}</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0A1628]/5 mb-3">
                  <Wrench className="text-[#C9A84C]" size={24} />
                </div>
                <p className="text-gray-600 font-medium">No maintenance requests yet</p>
                <p className="text-sm text-gray-400 mt-1">Submit a request if something in your unit needs attention</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
