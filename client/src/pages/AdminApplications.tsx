import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STATUS_COLORS: Record<string, string> = {
  incomplete: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-700",
  denied: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-200 text-gray-600",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-700",
  refunded: "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}

function ApplicationRow({ app }: { app: any }) {
  const [expanded, setExpanded] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(app.reviewNotes ?? "");
  const utils = trpc.useUtils();

  const updateStatus = trpc.application.admin.updateStatus.useMutation({
    onSuccess: () => utils.application.admin.getAll.invalidate(),
  });

  const handleStatus = (status: "under_review" | "approved" | "denied" | "withdrawn") => {
    updateStatus.mutate({ id: app.id, status, reviewNotes });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 text-left">
          <FileText className="w-5 h-5 text-[var(--luxe-gold)] flex-shrink-0" />
          <div>
            <p className="font-semibold text-[var(--luxe-navy)]">
              {app.firstName} {app.lastName}
            </p>
            <p className="text-sm text-gray-500">{app.email} · {app.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={app.status ?? "incomplete"} />
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PAYMENT_COLORS[app.paymentStatus ?? "pending"]}`}>
            {app.paymentStatus === "paid" ? "Paid" : "Unpaid"}
          </span>
          <span className="text-xs text-gray-400">
            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t p-5 bg-gray-50 space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            {/* Personal */}
            <div>
              <h4 className="font-bold text-[var(--luxe-navy)] mb-2">Personal Information</h4>
              <p><span className="text-gray-500">DOB:</span> {app.dateOfBirth}</p>
              <p><span className="text-gray-500">SSN (last 4):</span> {app.ssn ?? "—"}</p>
            </div>

            {/* Residence */}
            <div>
              <h4 className="font-bold text-[var(--luxe-navy)] mb-2">Current Residence</h4>
              <p>{app.currentAddress}</p>
              <p>{app.currentCity}, {app.currentState} {app.currentZip}</p>
              <p><span className="text-gray-500">Duration:</span> {app.currentLengthOfResidence ?? "—"}</p>
              <p><span className="text-gray-500">Landlord:</span> {app.currentLandlordName ?? "—"} {app.currentLandlordPhone ? `· ${app.currentLandlordPhone}` : ""}</p>
              <p><span className="text-gray-500">Rent:</span> {app.currentMonthlyRent ?? "—"}</p>
              {app.reasonForLeaving && <p><span className="text-gray-500">Reason leaving:</span> {app.reasonForLeaving}</p>}
            </div>

            {/* Employment */}
            <div>
              <h4 className="font-bold text-[var(--luxe-navy)] mb-2">Employment</h4>
              <p><span className="text-gray-500">Status:</span> {(app.employmentStatus ?? "—").replace("_", " ")}</p>
              {app.employerName && <p><span className="text-gray-500">Employer:</span> {app.employerName}</p>}
              {app.jobTitle && <p><span className="text-gray-500">Title:</span> {app.jobTitle}</p>}
              {app.monthsEmployed && <p><span className="text-gray-500">Duration:</span> {app.monthsEmployed} months</p>}
              {app.monthlyIncome && <p><span className="text-gray-500">Income:</span> {app.monthlyIncome}/mo</p>}
              {app.additionalIncome && <p><span className="text-gray-500">Add'l income:</span> {app.additionalIncome} ({app.additionalIncomeSource})</p>}
            </div>

            {/* References */}
            {app.references && Array.isArray(app.references) && app.references.length > 0 && (
              <div>
                <h4 className="font-bold text-[var(--luxe-navy)] mb-2">References</h4>
                {app.references.map((r: any, i: number) => (
                  <p key={i}>{r.name} · {r.phone} ({r.relationship})</p>
                ))}
              </div>
            )}

            {/* Voucher */}
            {app.hasVoucher && (
              <div>
                <h4 className="font-bold text-[var(--luxe-navy)] mb-2">
                  <span className="inline-flex items-center gap-1">
                    Housing Voucher
                    <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Active</span>
                  </span>
                </h4>
                <p><span className="text-gray-500">Type:</span> {(app.voucherType ?? "—").replace("section8_hcv", "Section 8 / HCV").replace("vash", "VASH").replace("other", "Other")}</p>
                {app.phaName && <p><span className="text-gray-500">PHA:</span> {app.phaName}</p>}
                {app.phaPhone && <p><span className="text-gray-500">PHA Phone:</span> {app.phaPhone}</p>}
                {app.phaEmail && <p><span className="text-gray-500">PHA Email:</span> {app.phaEmail}</p>}
                {app.voucherNumber && <p><span className="text-gray-500">Voucher #:</span> {app.voucherNumber}</p>}
                {app.voucherAmount && <p><span className="text-gray-500">HAP Amount:</span> {app.voucherAmount}/mo</p>}
                {app.voucherBedrooms && <p><span className="text-gray-500">Bedroom Size:</span> {app.voucherBedrooms === "0" ? "Studio" : `${app.voucherBedrooms} BR`}</p>}
                {app.voucherExpirationDate && <p><span className="text-gray-500">Expires:</span> {new Date(app.voucherExpirationDate).toLocaleDateString()}</p>}
              </div>
            )}

            {/* Background */}
            <div>
              <h4 className="font-bold text-[var(--luxe-navy)] mb-2">Background</h4>
              <p><span className="text-gray-500">Pets:</span> {app.hasPets ? `Yes — ${app.petDetails ?? ""}` : "No"}</p>
              <p><span className="text-gray-500">Eviction:</span> {app.hasEviction ? `Yes — ${app.evictionDetails ?? ""}` : "No"}</p>
              <p><span className="text-gray-500">Criminal:</span> {app.hasCriminalHistory ? `Yes — ${app.criminalDetails ?? ""}` : "No"}</p>
              <p><span className="text-gray-500">Bankruptcy:</span> {app.hasBankruptcy ? `Yes — ${app.bankruptcyDetails ?? ""}` : "No"}</p>
            </div>

            {/* Payment */}
            <div>
              <h4 className="font-bold text-[var(--luxe-navy)] mb-2">Payment</h4>
              <p><span className="text-gray-500">Fee:</span> ${app.applicationFee}</p>
              <p><span className="text-gray-500">Status:</span> {app.paymentStatus}</p>
              {app.stripePaymentIntentId && (
                <p className="text-xs font-mono text-gray-400 truncate">PI: {app.stripePaymentIntentId}</p>
              )}
            </div>
          </div>

          {/* Review Controls */}
          {(app.status === "submitted" || app.status === "under_review") && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-bold text-[var(--luxe-navy)]">Review Decision</h4>
              <div>
                <label className="block text-sm font-medium mb-1">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={2}
                  placeholder="Add internal notes about this applicant..."
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                {app.status === "submitted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatus("under_review")}
                    disabled={updateStatus.isPending}
                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Clock className="w-4 h-4 mr-1" /> Mark Under Review
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => handleStatus("approved")}
                  disabled={updateStatus.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatus("denied")}
                  disabled={updateStatus.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Deny
                </Button>
              </div>
              {updateStatus.isSuccess && (
                <p className="text-sm text-green-600 font-medium">Status updated successfully.</p>
              )}
            </div>
          )}

          {app.reviewNotes && app.status !== "submitted" && app.status !== "under_review" && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 font-medium">Review Notes</p>
              <p className="text-sm text-gray-700 mt-1">{app.reviewNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminApplications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: applications, isLoading } = trpc.application.admin.getAll.useQuery();

  const filtered = (applications ?? []).filter((app: any) => {
    const name = `${app.firstName} ${app.lastName} ${app.email}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: applications?.length ?? 0,
    submitted: applications?.filter((a: any) => a.status === "submitted").length ?? 0,
    under_review: applications?.filter((a: any) => a.status === "under_review").length ?? 0,
    approved: applications?.filter((a: any) => a.status === "approved").length ?? 0,
    denied: applications?.filter((a: any) => a.status === "denied").length ?? 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: counts.all, color: "text-[var(--luxe-navy)]" },
            { label: "Submitted", value: counts.submitted, color: "text-blue-600" },
            { label: "Under Review", value: counts.under_review, color: "text-yellow-600" },
            { label: "Approved", value: counts.approved, color: "text-green-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicants..."
              className="pl-9"
            />
          </div>
          <select
            className="px-3 py-2 border rounded-md text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading applications...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No applications found</p>
              <p className="text-sm mt-1">Applications submitted via the tenant portal will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((app: any) => (
              <ApplicationRow key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
