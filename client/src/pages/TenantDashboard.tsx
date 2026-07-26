import React from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CreditCard, Wrench, AlertCircle } from "lucide-react";

export default function TenantDashboard() {
  const { data: stats, isLoading } = trpc.tenant.getStats.useQuery();
  const { data: tenant } = trpc.tenant.getTenantInfo.useQuery();
  const { data: user } = trpc.auth.me.useQuery();

  // Check if user is tenant or admin
  if (user && user.role !== "tenant" && user.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600">You do not have permission to access the tenant portal.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="hover:shadow-lg transition">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name || "Tenant"}!</h1>
          <p className="text-purple-100">
            {tenant ? `Unit: ${tenant.unitId}` : "Manage your lease, payments, and maintenance requests."}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Invoices"
            value={stats?.totalInvoices || 0}
            icon={FileText}
            color="text-blue-500"
          />
          <StatCard
            title="Payments"
            value={stats?.totalPayments || 0}
            icon={CreditCard}
            color="text-green-500"
          />
          <StatCard
            title="Maintenance Requests"
            value={stats?.totalMaintenanceRequests || 0}
            icon={Wrench}
            color="text-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">View your payment history and invoices</p>
                <a
                  href="/tenant/payments"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Payments
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Submit and track maintenance requests</p>
                <a
                  href="/tenant/maintenance"
                  className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  View Requests
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Lease Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lease Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {tenant?.leaseStartDate
                    ? `Lease Start: ${new Date(tenant.leaseStartDate).toLocaleDateString()}`
                    : "No lease information available"}
                </p>
                <p className="text-sm text-gray-600">
                  {tenant?.leaseEndDate
                    ? `Lease End: ${new Date(tenant.leaseEndDate).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Access your lease and other documents</p>
                <a
                  href="/tenant/documents"
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  View Documents
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Portal Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Welcome to your tenant portal!</strong> From here you can view your payment history,
                submit maintenance requests, access your lease documents, and manage your account. Use the
                sidebar navigation to access different sections.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
