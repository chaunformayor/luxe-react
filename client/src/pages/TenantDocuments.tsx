import React from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download } from "lucide-react";

export default function TenantDocuments() {
  const { data: documents, isLoading } = trpc.tenant.getDocuments.useQuery();

  const documentTypeIcons: Record<string, string> = {
    lease: "📋",
    invoice: "📄",
    payment_receipt: "💳",
    maintenance: "🔧",
    other: "📎",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Documents</h1>
          <p className="text-gray-600 mt-1">Access your lease agreement, invoices, and other important documents</p>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </>
          ) : documents && documents.length > 0 ? (
            documents.map((doc: any) => (
              <Card key={doc.id} className="hover:shadow-lg transition cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">
                      {documentTypeIcons[doc.type] || documentTypeIcons.other}
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{doc.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {doc.type.replace("_", " ").charAt(0).toUpperCase() + doc.type.slice(1)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-gray-500">No documents available yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your lease and other documents will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Document Info */}
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-blue-800">
                <strong>Lease Agreement:</strong> Your signed lease document with terms and conditions.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Invoices:</strong> Monthly rent invoices and billing statements.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Payment Receipts:</strong> Confirmation of your rent payments.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Maintenance Records:</strong> Documentation of maintenance and repairs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
