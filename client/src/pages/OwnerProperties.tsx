import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import OwnerLayout from "@/components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, X, Star, StarOff } from "lucide-react";

function PropertyModal({ property, onClose }: { property: any; onClose: () => void }) {
  const images: string[] = (() => { try { return JSON.parse(property.images || "[]"); } catch { return []; } })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#0A1628]">{property.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.slice(0, 4).map((url: string, i: number) => (
                <img key={i} src={url} alt="" className="w-full h-32 object-cover rounded-lg" />
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Address</p>
              <p className="text-gray-800 mt-0.5">{property.address}, {property.city}, {property.state} {property.zipCode}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Type</p>
              <p className="text-gray-800 mt-0.5">{property.type}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Price</p>
              <p className="text-gray-800 mt-0.5">${parseFloat(property.price).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Size</p>
              <p className="text-gray-800 mt-0.5">{property.beds} bd · {property.baths} ba · {property.sqft?.toLocaleString()} sqft</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Status</p>
              <p className={`mt-0.5 font-semibold ${property.active ? "text-green-600" : "text-gray-400"}`}>
                {property.active ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Featured</p>
              <p className={`mt-0.5 font-semibold ${property.featured ? "text-[#C9A84C]" : "text-gray-400"}`}>
                {property.featured ? "Yes" : "No"}
              </p>
            </div>
          </div>
          {property.description && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{property.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OwnerProperties() {
  const { data: properties, isLoading, refetch } = trpc.owner.getProperties.useQuery();
  const updateMutation = trpc.owner.updateProperty.useMutation({ onSuccess: () => refetch() });
  const [viewingProperty, setViewingProperty] = useState<any | null>(null);

  const handleToggleFeatured = (property: any) => {
    updateMutation.mutate({ id: property.id, featured: !property.featured });
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#0A1628]">My Properties</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#0A1628]">All Properties ({properties?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Address</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Price</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-widest text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property: any) => (
                      <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-[#0A1628]">{property.name}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {property.address}, {property.city}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            property.type === "Rent" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                          }`}>
                            {property.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#0A1628]">
                          ${parseFloat(property.price).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            property.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {property.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleToggleFeatured(property)}
                              className={`p-2 rounded-lg transition ${property.featured ? "text-[#C9A84C] hover:bg-yellow-50" : "text-gray-400 hover:bg-gray-50"}`}
                              title={property.featured ? "Remove from featured" : "Mark as featured"}
                            >
                              {property.featured ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                            </button>
                            <button
                              onClick={() => setViewingProperty(property)}
                              className="p-2 text-[#0A1628] hover:bg-gray-100 rounded-lg transition"
                              title="View details"
                            >
                              <Building2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="mx-auto mb-3 text-gray-300" size={40} />
                <p className="text-gray-500 font-medium">No properties found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {viewingProperty && (
        <PropertyModal property={viewingProperty} onClose={() => setViewingProperty(null)} />
      )}
    </OwnerLayout>
  );
}
