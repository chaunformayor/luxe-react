import { Download, FileSignature, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DOCUMENT_TYPE_LABELS, formatBytes, type DocumentType } from "@shared/documents";

type PortalDocument = {
  id: string;
  name: string;
  type: string;
  sizeBytes?: number | null;
  signatureRequestId?: string | null;
  createdAt?: Date | string | null;
};

export default function PortalDocuments({
  documents,
  isLoading,
  emptyHint,
}: {
  documents: PortalDocument[] | undefined;
  isLoading: boolean;
  emptyHint: string;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const sorted = [...(documents ?? [])].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  if (!sorted.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-500">No documents available yet</p>
            <p className="text-sm text-gray-400 mt-1">{emptyHint}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((doc) => {
        const Icon = doc.signatureRequestId ? FileSignature : FileText;
        return (
          <a key={doc.id} href={`/api/docs/document/${doc.id}`} target="_blank" rel="noopener noreferrer" className="block group">
            <Card className="h-full group-hover:shadow-lg transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <Icon className="text-[#C9A84C] shrink-0" size={28} />
                  <span className="p-2 text-blue-600 group-hover:bg-blue-50 rounded-lg transition" title="Open / download">
                    <Download size={18} />
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 break-words">{doc.name}</h3>
                <p className="text-xs text-gray-500 mb-3">
                  {DOCUMENT_TYPE_LABELS[doc.type as DocumentType] ?? "Document"}
                  {doc.signatureRequestId ? " · Signed electronically" : ""}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}</span>
                  <span>{formatBytes(doc.sizeBytes)}</span>
                </div>
              </CardContent>
            </Card>
          </a>
        );
      })}
    </div>
  );
}
