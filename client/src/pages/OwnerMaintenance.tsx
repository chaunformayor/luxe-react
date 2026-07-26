import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench } from "lucide-react";

export default function OwnerMaintenance() {
  const { data: requests, isLoading } = trpc.owner.getMaintenanceRequests.useQuery();
  const [filterStatus, setFilterStatus] = useState<string>("all");

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

        {/* Requests Table */}
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
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
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
                    <p className="text-sm text-gray-600 mb-2">{request.description}</p>
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
                <p className="text-gray-500">No maintenance requests found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
