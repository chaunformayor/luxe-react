import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";

export default function AdminProperties() {
  const { data: properties, isLoading, refetch } = trpc.admin.getAllProperties.useQuery();
  const updateMutation = trpc.admin.updateProperty.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteMutation = trpc.admin.deleteProperty.useMutation({
    onSuccess: () => refetch(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleFeatured = async (property: any) => {
    await updateMutation.mutateAsync({
      id: property.id,
      featured: !property.featured,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus size={20} className="mr-2" />
            Add Property
          </Button>
        </div>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Address</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property: any) => (
                      <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{property.name}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {property.address}, {property.city}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            property.type === "Rent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {property.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          ${parseFloat(property.price).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            property.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {property.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleFeatured(property)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                              title={property.featured ? "Remove from featured" : "Add to featured"}
                            >
                              <Eye size={18} />
                            </button>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(property.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No properties found. Create one to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
