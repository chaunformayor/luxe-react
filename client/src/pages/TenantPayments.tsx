import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, FileText } from "lucide-react";

export default function TenantPayments() {
  const { data: payments, isLoading: paymentsLoading } = trpc.tenant.getPayments.useQuery();
  const { data: invoices, isLoading: invoicesLoading } = trpc.tenant.getInvoices.useQuery();
  const [activeTab, setActiveTab] = useState<"payments" | "invoices">("invoices");

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800",
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment & Invoice History</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "invoices"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Invoices
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "payments"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CreditCard size={16} className="inline mr-2" />
            Payments
          </button>
        </div>

        {/* Invoices Table */}
        {activeTab === "invoices" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Invoices ({invoices?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : invoices && invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice: any) => (
                        <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            ${parseFloat(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[invoice.status] || statusColors.draft
                              }`}
                            >
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-500">No invoices found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payments Table */}
        {activeTab === "payments" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Payments ({payments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : payments && payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment: any) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                            {payment.paidDate
                              ? new Date(payment.paidDate).toLocaleDateString()
                              : new Date(payment.createdAt).toLocaleDateString()}
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
        )}
      </div>
    </AdminLayout>
  );
}
