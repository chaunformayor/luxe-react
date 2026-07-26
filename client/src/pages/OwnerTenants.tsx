import React from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function OwnerTenants() {
  const { data: tenants, isLoading } = trpc.owner.getTenants.useQuery();

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    evicted: "bg-red-100 text-red-800",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
        </div>

        {/* Tenants Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tenants ({tenants?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : tenants && tenants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tenant ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Lease Start</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Lease End</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tenant: any) => (
                      <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium text-sm">
                          {tenant.id.substring(0, 12)}...
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {tenant.unitId?.substring(0, 12) || "N/A"}...
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {tenant.leaseStartDate
                            ? new Date(tenant.leaseStartDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {tenant.leaseEndDate
                            ? new Date(tenant.leaseEndDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[tenant.status] || statusColors.active
                            }`}
                          >
                            {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-500">No tenants found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
