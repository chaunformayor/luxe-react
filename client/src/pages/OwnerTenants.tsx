import React from "react";
import { trpc } from "@/lib/trpc";
import OwnerLayout from "@/components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  evicted: "bg-red-100 text-red-800",
};

export default function OwnerTenants() {
  const { data: tenants, isLoading } = trpc.owner.getTenants.useQuery();

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#0A1628]">Tenants</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#0A1628]">Your Tenants ({tenants?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : tenants && tenants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Tenant</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Unit</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Property</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Rent</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Lease End</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tenant: any) => (
                      <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0A1628]">{tenant.userName || "—"}</div>
                          <div className="text-xs text-gray-400">{tenant.userEmail || "—"}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {tenant.unitNumber ? `Unit ${tenant.unitNumber}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <div>{tenant.propertyName || "—"}</div>
                          {tenant.propertyAddress && (
                            <div className="text-xs text-gray-400 truncate max-w-[180px]">{tenant.propertyAddress}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#0A1628]">
                          {tenant.rentAmount ? `$${Number(tenant.rentAmount).toLocaleString()}/mo` : "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {tenant.leaseEndDate
                            ? new Date(tenant.leaseEndDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[tenant.status] || statusColors.active}`}>
                            {tenant.status?.charAt(0).toUpperCase() + tenant.status?.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto mb-3 text-gray-300" size={40} />
                <p className="text-gray-500 font-medium">No tenants found</p>
                <p className="text-xs text-gray-400 mt-1">Tenants will appear here once assigned to your units.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerLayout>
  );
}
