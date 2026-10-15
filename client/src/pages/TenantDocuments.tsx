import { trpc } from "@/lib/trpc";
import TenantLayout from "@/components/TenantLayout";
import PortalDocuments from "@/components/PortalDocuments";

export default function TenantDocuments() {
  const { data: documents, isLoading } = trpc.tenant.getDocuments.useQuery();

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Documents</h1>
          <p className="text-gray-600 mt-1">Your lease and other documents from Luxe Property Solutions</p>
        </div>
        <PortalDocuments
          documents={documents}
          isLoading={isLoading}
          emptyHint="Your lease and other documents will appear here"
        />
      </div>
    </TenantLayout>
  );
}
