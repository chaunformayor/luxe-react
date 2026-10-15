export const DOCUMENT_TYPE_LABELS = {
  lease: "Lease",
  management_agreement: "Management Agreement",
  w9: "W-9",
  lien_waiver: "Lien Waiver / Release",
  inspection: "Inspection",
  maintenance: "Maintenance",
  invoice: "Invoice",
  other: "Other",
} as const;

export type DocumentType = keyof typeof DOCUMENT_TYPE_LABELS;

export const SIGNATURE_CATEGORY_LABELS = {
  lease: "Lease",
  management_agreement: "Management Agreement",
  lien_waiver: "Lien Waiver / Release",
  w9: "W-9",
  other: "Other",
} as const;

export type SignatureCategory = keyof typeof SIGNATURE_CATEGORY_LABELS;

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
