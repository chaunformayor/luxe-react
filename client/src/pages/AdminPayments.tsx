import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, TrendingUp } from "lucide-react";

export default function AdminPayments() {
  const { data: payments, isLoading } = trpc.admin.getAllPayments.useQuery();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredPayments = payments?.filter((payment: any) =>
    filterStatus === "all" ? true : payment.status === filterStatus
  ) || [];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800",
  };

  const totalRevenue = payments?.reduce((sum: number, p: any) => {
    return p.status === "completed" ? sum + parseFloat(p.amount) : sum;
  }, 0) || 0;

  const pendingAmount = payments?.reduce((sum: number, p: any) => {
    return p.status === "pending" ? sum + parseFloat(p.amount) : sum;
  }, 0) || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
          <div className="flex gap-2">
            {["all", "pending", "completed", "failed", "refunded"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500 mt-1">From completed payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${pendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Awaiting completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Payments ({filteredPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">User ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Paid Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment: any) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium text-sm">
                          {payment.userId.substring(0, 8)}...
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          ${parseFloat(payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {payment.paymentMethod.replace("_", " ").charAt(0).toUpperCase() +
                            payment.paymentMethod.slice(1)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[payment.status] || statusColors.pending
                            }`}
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {payment.dueDate
                            ? new Date(payment.dueDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {payment.paidDate
                            ? new Date(payment.paidDate).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-500">No payments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
