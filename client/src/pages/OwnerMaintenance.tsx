import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import OwnerLayout from "@/components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench } from "lucide-react";

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

const filterLabels: Record<string, string> = {
  all: "All",
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
};

export default function OwnerMaintenance() {
  const { data: requests, isLoading } = trpc.owner.getMaintenanceRequests.useQuery();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredRequests = requests?.filter((req: any) =>
    filterStatus === "all" ? true : req.status === filterStatus
  ) || [];

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-[#0A1628]">Maintenance Requests</h1>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filterLabels).map(([status, label]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filterStatus === status
                    ? "bg-[#0A1628] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#0A1628]">Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="space-y-3">
                {filteredRequests.map((request: any) => (
                  <div key={request.id} className="p-4 border border-gray-200 rounded-xl hover:border-[#C9A84C]/50 transition">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#0A1628] truncate">{request.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {request.propertyName || "Unknown property"}
                          {request.propertyAddress && (
                            <span className="text-gray-400"> · {request.propertyAddress}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status] || statusColors.open}`}>
                          {request.status === "in_progress" ? "In Progress" : request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority] || priorityColors.medium}`}>
                          {request.priority?.charAt(0).toUpperCase() + request.priority?.slice(1)}
                        </span>
                      </div>
                    </div>
                    {request.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Assigned to: {request.assignedTo || "Unassigned"}</span>
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wrench className="mx-auto mb-3 text-gray-300" size={40} />
                <p className="text-gray-500 font-medium">No maintenance requests found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerLayout>
  );
}
