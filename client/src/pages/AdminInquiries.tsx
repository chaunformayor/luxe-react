import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Mail, Phone, Calendar, Clock, Check, X } from "lucide-react";

export default function AdminInquiries() {
  const { data: inquiries = [], isLoading, refetch } = trpc.admin.getAllInquiries.useQuery();
  const updateInquiryMutation = trpc.admin.updateInquiry.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedInquiry(null);
      setNotes("");
      setNewStatus("");
    },
  });

  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Filter and search inquiries
  const filteredInquiries = useMemo(() => {
    return (inquiries as any[]).filter((inquiry) => {
      const matchesSearch =
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchTerm, statusFilter]);

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry) return;

    try {
      await updateInquiryMutation.mutateAsync({
        id: selectedInquiry.id,
        status: newStatus ? (newStatus as any) : undefined,
        notes: notes || undefined,
      });
    } catch (error) {
      console.error("Error updating inquiry:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="w-4 h-4" />;
      case "contacted":
        return <Mail className="w-4 h-4" />;
      case "qualified":
        return <Check className="w-4 h-4" />;
      case "closed":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Form Submissions</h1>
          <p className="text-gray-600">Manage and track all inquiries from your website</p>
        </div>

        {/* Inquiries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inquiries List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      onClick={() => setStatusFilter("all")}
                      className="gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      All ({inquiries.length})
                    </Button>
                    <Button
                      variant={statusFilter === "new" ? "default" : "outline"}
                      onClick={() => setStatusFilter("new")}
                    >
                      New ({(inquiries as any[]).filter((i) => i.status === "new").length})
                    </Button>
                    <Button
                      variant={statusFilter === "contacted" ? "default" : "outline"}
                      onClick={() => setStatusFilter("contacted")}
                    >
                      Contacted ({(inquiries as any[]).filter((i) => i.status === "contacted").length})
                    </Button>
                    <Button
                      variant={statusFilter === "qualified" ? "default" : "outline"}
                      onClick={() => setStatusFilter("qualified")}
                    >
                      Qualified ({(inquiries as any[]).filter((i) => i.status === "qualified").length})
                    </Button>
                    <Button
                      variant={statusFilter === "closed" ? "default" : "outline"}
                      onClick={() => setStatusFilter("closed")}
                    >
                      Closed ({(inquiries as any[]).filter((i) => i.status === "closed").length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inquiries List */}
            <div className="space-y-3">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    Loading inquiries...
                  </CardContent>
                </Card>
              ) : filteredInquiries.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No inquiries found
                  </CardContent>
                </Card>
              ) : (
                filteredInquiries.map((inquiry: any) => (
                  <Card
                    key={inquiry.id}
                    className={`cursor-pointer transition-all ${
                      selectedInquiry?.id === inquiry.id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      setNotes(inquiry.notes || "");
                      setNewStatus(inquiry.status);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {inquiry.name}
                            </h3>
                            <Badge className={`gap-1 ${getStatusColor(inquiry.status)}`}>
                              {getStatusIcon(inquiry.status)}
                              {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {inquiry.email}
                            </div>
                            {inquiry.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {inquiry.phone}
                              </div>
                            )}
                            {inquiry.propertyType && (
                              <div className="text-sm">
                                <strong>Property Type:</strong> {inquiry.propertyType}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {new Date(inquiry.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 line-clamp-2">
                            {inquiry.message}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Inquiry Details */}
          <div>
            {selectedInquiry ? (
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Inquiry Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">{selectedInquiry.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{selectedInquiry.email}</p>
                      </div>
                      {selectedInquiry.phone && (
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <p className="font-medium">{selectedInquiry.phone}</p>
                        </div>
                      )}
                      {selectedInquiry.propertyType && (
                        <div>
                          <span className="text-gray-600">Property Type:</span>
                          <p className="font-medium">{selectedInquiry.propertyType}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Message</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedInquiry.message}
                    </p>
                  </div>

                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Internal Notes</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add internal notes about this inquiry..."
                      rows={4}
                      className="text-sm"
                    />
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                    <p>
                      <strong>Received:</strong> {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Last Updated:</strong> {new Date(selectedInquiry.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleUpdateInquiry}
                      disabled={updateInquiryMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {updateInquiryMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={() => setSelectedInquiry(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Select an inquiry to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
