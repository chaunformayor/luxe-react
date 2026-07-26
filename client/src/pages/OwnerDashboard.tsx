import React from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, DollarSign, AlertCircle } from "lucide-react";

export default function OwnerDashboard() {
  const { data: stats, isLoading } = trpc.owner.getStats.useQuery();
  const { data: user } = trpc.auth.me.useQuery();

  // Check if user is owner or admin
  if (user && user.role !== "owner" && user.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600">You do not have permission to access the owner portal.</p>
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
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name || "Owner"}!</h1>
          <p className="text-green-100">Manage your properties, tenants, and view financial reports.</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Properties"
            value={stats?.totalProperties || 0}
            icon={Building2}
            color="text-blue-500"
          />
          <StatCard
            title="Active Tenants"
            value={stats?.totalTenants || 0}
            icon={Users}
            color="text-green-500"
          />
          <StatCard
            title="Pending Maintenance"
            value={stats?.pendingMaintenance || 0}
            icon={AlertCircle}
            color="text-orange-500"
          />
          <StatCard
            title="Total Revenue"
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="text-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Your Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">View and manage all your properties</p>
                <a
                  href="/owner/properties"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Properties
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Management */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Manage tenants across your properties</p>
                <a
                  href="/owner/tenants"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  View Tenants
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Financial Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">View payments, invoices, and revenue</p>
                <a
                  href="/owner/payments"
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  View Payments
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Track maintenance requests and work orders</p>
                <a
                  href="/owner/maintenance"
                  className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  View Maintenance
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Owner Portal Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Welcome to your owner portal!</strong> From here you can manage all your properties,
                track tenants, view financial reports, and monitor maintenance requests. Use the sidebar
                navigation to access different sections of your portal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
