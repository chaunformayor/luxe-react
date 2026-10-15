import { trpc } from "@/lib/trpc";
import OwnerLayout from "@/components/OwnerLayout";
import PortalDocuments from "@/components/PortalDocuments";

export default function OwnerDocuments() {
  const { data: documents, isLoading } = trpc.owner.getDocuments.useQuery();

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Your management agreement and property documents</p>
        </div>
        <PortalDocuments
          documents={documents}
          isLoading={isLoading}
          emptyHint="Your management agreement and property documents will appear here"
        />
      </div>
    </OwnerLayout>
  );
}
