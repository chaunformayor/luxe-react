import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, Plus } from "lucide-react";

export default function TenantMaintenance() {
  const { data: requests, isLoading, refetch } = trpc.tenant.getMaintenanceRequests.useQuery();
  const createMutation = trpc.tenant.createMaintenanceRequest.useMutation({
    onSuccess: () => refetch(),
  });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setFormData({ title: "", description: "", priority: "medium" });
    setShowForm(false);
  };

  const statusColors: Record<string, string> = {
    open: "bg-red-100 text-red-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus size={16} className="mr-2" />
            Submit Request
          </Button>
        </div>

        {/* Submit Form */}
        {showForm && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle>Submit New Maintenance Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Leaky faucet in kitchen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe the issue in detail..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {createMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Maintenance Requests ({requests?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : requests && requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map((request: any) => (
                  <div
                    key={request.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[request.status] || statusColors.open
                          }`}
                        >
                          {request.status.replace("_", " ").charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            priorityColors[request.priority] || priorityColors.medium
                          }`}
                        >
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Assigned to: {request.assignedTo || "Unassigned"}</span>
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-500">No maintenance requests yet</p>
                <p className="text-sm text-gray-400 mt-1">Submit a request to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
