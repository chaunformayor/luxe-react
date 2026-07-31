import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import OwnerLayout from "@/components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, FileText, TrendingUp, DollarSign } from "lucide-react";

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

export default function OwnerPayments() {
  const { data: payments, isLoading: paymentsLoading } = trpc.owner.getPayments.useQuery();
  const { data: invoices, isLoading: invoicesLoading } = trpc.owner.getInvoices.useQuery();
  const [activeTab, setActiveTab] = useState<"payments" | "invoices">("invoices");

  const totalRevenue = payments?.reduce((sum: number, p: any) =>
    p.status === "completed" ? sum + parseFloat(p.amount) : sum, 0) || 0;

  const openInvoices = invoices?.filter((i: any) => i.status === "sent" || i.status === "overdue").length || 0;

  const tabs = [
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "payments", label: "Payment History", icon: CreditCard },
  ] as const;

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#0A1628]">Payments & Invoices</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Revenue</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#0A1628]/5 flex items-center justify-center">
                <TrendingUp size={16} className="text-[#C9A84C]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A1628]">
                ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400 mt-1">Completed payments</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Open Invoices</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#0A1628]/5 flex items-center justify-center">
                <FileText size={16} className="text-[#C9A84C]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A1628]">{openInvoices}</div>
              <p className="text-xs text-gray-400 mt-1">Sent or overdue</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Invoices</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#0A1628]/5 flex items-center justify-center">
                <DollarSign size={16} className="text-[#C9A84C]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0A1628]">{invoices?.length || 0}</div>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
                activeTab === id
                  ? "border-[#C9A84C] text-[#0A1628]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Invoices Table */}
        {activeTab === "invoices" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0A1628]">Invoices ({invoices?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : invoices && invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Tenant</th>
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Unit</th>
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Amount</th>
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Due Date</th>
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice: any) => (
                        <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-[#0A1628]">{invoice.userName || "—"}</td>
                          <td className="py-3 px-4 text-gray-600">{invoice.unitNumber ? `Unit ${invoice.unitNumber}` : "—"}</td>
                          <td className="py-3 px-4 font-semibold text-[#0A1628]">
                            ${parseFloat(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status] || statusColors.draft}`}>
                              {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-gray-600">{invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto mb-3 text-gray-300" size={40} />
                  <p className="text-gray-500 font-medium">No invoices found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payments Table */}
        {activeTab === "payments" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0A1628]">Payment History ({payments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : payments && payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Tenant</th>
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Unit</th>
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Amount</th>
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Method</th>
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment: any) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-[#0A1628]">{payment.userName || "—"}</td>
                          <td className="py-3 px-4 text-gray-600">{payment.unitNumber ? `Unit ${payment.unitNumber}` : "—"}</td>
                          <td className="py-3 px-4 font-semibold text-[#0A1628]">
                            ${parseFloat(payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-gray-600 capitalize">
                            {payment.paymentMethod?.replace("_", " ")}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[payment.status] || statusColors.pending}`}>
                              {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {payment.paidDate
                              ? new Date(payment.paidDate).toLocaleDateString()
                              : payment.dueDate
                              ? new Date(payment.dueDate).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto mb-3 text-gray-300" size={40} />
                  <p className="text-gray-500 font-medium">No payments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </OwnerLayout>
  );
}
