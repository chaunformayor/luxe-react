import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, AlertTriangle } from "lucide-react";

export default function AdminMaintenance() {
  const { data: requests, isLoading, refetch } = trpc.admin.getAllMaintenanceRequests.useQuery();
  const updateMutation = trpc.admin.updateMaintenanceRequest.useMutation({
    onSuccess: () => refetch(),
  });

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleStatusChange = async (id: string, status: string) => {
    await updateMutation.mutateAsync({
      id,
      status: status as any,
    });
  };

  const handlePriorityChange = async (id: string, priority: string) => {
    await updateMutation.mutateAsync({
      id,
      priority: priority as any,
    });
  };

  const filteredRequests = requests?.filter((req: any) =>
    filterStatus === "all" ? true : req.status === filterStatus
  ) || [];

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
          <div className="flex gap-2">
            {["all", "open", "in_progress", "completed", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Requests ({filteredRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : filteredRequests.length > 0 ? (
                  <div className="space-y-3">
                    {filteredRequests.map((request: any) => (
                      <div
                        key={request.id}
                        onClick={() => setSelectedRequest(request)}
                        className={`p-4 border rounded-lg cursor-pointer transition ${
                          selectedRequest?.id === request.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{request.title}</h3>
                            <p className="text-sm text-gray-600">
                              Property ID: {request.propertyId}
                            </p>
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
                        <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wrench className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-gray-500">No maintenance requests found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Request Details */}
          <div>
            {selectedRequest ? (
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Title</label>
                    <p className="text-gray-900">{selectedRequest.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <p className="text-gray-900 text-sm">{selectedRequest.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Priority</label>
                    <select
                      value={selectedRequest.priority}
                      onChange={(e) =>
                        handlePriorityChange(selectedRequest.id, e.target.value)
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <select
                      value={selectedRequest.status}
                      onChange={(e) =>
                        handleStatusChange(selectedRequest.id, e.target.value)
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Assigned To</label>
                    <p className="text-gray-900 text-sm">
                      {selectedRequest.assignedTo || "Unassigned"}
                    </p>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Select a request to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
