import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, FileText, DollarSign } from "lucide-react";

const invoiceStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
};

export default function TenantPayments() {
  const { data: payments, isLoading: paymentsLoading } = trpc.tenant.getPayments.useQuery();
  const { data: invoices, isLoading: invoicesLoading } = trpc.tenant.getInvoices.useQuery();
  const { data: lease } = trpc.tenant.getLease.useQuery();
  const [activeTab, setActiveTab] = useState<"invoices" | "payments">("invoices");

  const totalPaid = payments?.filter((p: any) => p.status === "completed")
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0) ?? 0;

  const overdueInvoices = invoices?.filter((i: any) => i.status === "overdue").length ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#0A1628]">Payments & Invoices</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Rent</CardTitle>
              <DollarSign className="h-4 w-4 text-[#C9A84C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A1628]">
                {lease?.rentAmount ? `$${parseFloat(lease.rentAmount).toLocaleString()}` : "—"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A1628]">${totalPaid.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue Invoices</CardTitle>
              <FileText className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overdueInvoices > 0 ? "text-red-600" : "text-[#0A1628]"}`}>
                {overdueInvoices}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {(["invoices", "payments"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#C9A84C] text-[#0A1628]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}>
              {tab === "invoices" ? <><FileText size={14} className="inline mr-1.5" />Invoices</> : <><CreditCard size={14} className="inline mr-1.5" />Payments</>}
            </button>
          ))}
        </div>

        {/* Invoices */}
        {activeTab === "invoices" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Invoices ({invoices?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : invoices && invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {["Amount", "Status", "Due Date", "Paid Date", "Description"].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv: any) => (
                        <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-[#0A1628]">
                            ${parseFloat(inv.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoiceStatusColors[inv.status] || invoiceStatusColors.draft}`}>
                              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {inv.paidDate ? new Date(inv.paidDate).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                            {inv.description || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0A1628]/5 mb-3">
                    <FileText className="text-[#C9A84C]" size={24} />
                  </div>
                  <p className="text-gray-600 font-medium">No invoices yet</p>
                  <p className="text-sm text-gray-400 mt-1">Invoices will appear here when issued by your property manager</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payments */}
        {activeTab === "payments" && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History ({payments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : payments && payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {["Amount", "Method", "Status", "Date", "Description"].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((pmt: any) => (
                        <tr key={pmt.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-[#0A1628]">
                            ${parseFloat(pmt.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                            {pmt.paymentMethod?.replace("_", " ") || "—"}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[pmt.status] || paymentStatusColors.pending}`}>
                              {pmt.status.charAt(0).toUpperCase() + pmt.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {pmt.paidDate
                              ? new Date(pmt.paidDate).toLocaleDateString()
                              : new Date(pmt.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                            {pmt.description || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0A1628]/5 mb-3">
                    <CreditCard className="text-[#C9A84C]" size={24} />
                  </div>
                  <p className="text-gray-600 font-medium">No payments recorded</p>
                  <p className="text-sm text-gray-400 mt-1">Your payment history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
