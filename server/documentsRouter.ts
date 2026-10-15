import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import { adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { documents, properties, tenants, units, users, DOCUMENT_TYPES } from "../drizzle/schema";
import * as nc from "./nextcloud";

export const FOLDERS = {
  tenants: "/Tenants",
  owners: "/Owners",
  vendors: "/Vendors",
  properties: "/Properties",
  templates: "/Templates",
  esign: "/E-Sign Originals",
} as const;

export async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return db;
}

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

// ── Party lookups & folder conventions ────────────────────────────────────────

export async function getTenantParty(tenantId: string) {
  const db = await requireDb();
  const [row] = await db
    .select({ id: tenants.id, name: users.name, email: users.email })
    .from(tenants)
    .leftJoin(users, eq(tenants.userId, users.id))
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
  const label = row.name || row.email || row.id;
  return { ...row, label, folder: nc.joinPath(FOLDERS.tenants, nc.safeName(label)) };
}

export async function getOwnerParty(ownerUserId: string) {
  const db = await requireDb();
  const [row] = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).where(eq(users.id, ownerUserId)).limit(1);
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Owner not found" });
  const label = row.name || row.email || row.id;
  return { ...row, label, folder: nc.joinPath(FOLDERS.owners, nc.safeName(label)) };
}

export async function getPropertyParty(propertyId: string) {
  const db = await requireDb();
  const [row] = await db
    .select({ id: properties.id, name: properties.name, address: properties.address, ownerId: properties.ownerId })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
  const label = row.name || row.address;
  return { ...row, label, folder: nc.joinPath(FOLDERS.properties, nc.safeName(label)) };
}

export function vendorFolder(name: string) {
  return nc.joinPath(FOLDERS.vendors, nc.safeName(name));
}

const shareTarget = z.object({
  tenantId: z.string().optional(),
  ownerUserId: z.string().optional(),
  propertyId: z.string().optional(),
});

export async function createDocumentRecord(data: {
  name: string;
  type: (typeof DOCUMENT_TYPES)[number];
  nextcloudPath: string;
  nextcloudFileId: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  tenantId?: string | null;
  ownerUserId?: string | null;
  propertyId?: string | null;
  signatureRequestId?: string | null;
  uploadedBy?: string | null;
}) {
  const db = await requireDb();
  const id = newId("doc");
  await db.insert(documents).values({
    id,
    name: data.name,
    type: data.type,
    nextcloudPath: data.nextcloudPath,
    nextcloudFileId: data.nextcloudFileId,
    mimeType: data.mimeType ?? null,
    sizeBytes: data.sizeBytes ?? null,
    tenantId: data.tenantId ?? null,
    ownerUserId: data.ownerUserId ?? null,
    propertyId: data.propertyId ?? null,
    signatureRequestId: data.signatureRequestId ?? null,
    uploadedBy: data.uploadedBy ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export const documentsRouter = router({
  status: adminProcedure.query(() => {
    try {
      return { configured: true, webUrl: nc.nextcloudWebUrl("/") };
    } catch {
      return { configured: false, webUrl: null };
    }
  }),

  browse: adminProcedure.input(z.object({ path: z.string().default("/") })).query(async ({ input }) => {
    const path = nc.normalizePath(input.path);
    const items = await nc.listFolder(path);

    const fileIds = items.filter((i) => !i.isFolder && i.fileId).map((i) => i.fileId as string);
    const db = await requireDb();
    const shares = fileIds.length
      ? await db
          .select({
            id: documents.id,
            fileId: documents.nextcloudFileId,
            type: documents.type,
            tenantId: documents.tenantId,
            ownerUserId: documents.ownerUserId,
            propertyId: documents.propertyId,
          })
          .from(documents)
          .where(inArray(documents.nextcloudFileId, fileIds))
      : [];

    return {
      path,
      webUrl: nc.nextcloudWebUrl(path),
      items: items.map((item) => ({ ...item, shares: shares.filter((s) => s.fileId === item.fileId) })),
    };
  }),

  createFolder: adminProcedure
    .input(z.object({ parent: z.string(), name: z.string().min(1).max(150) }))
    .mutation(async ({ input }) => {
      const path = nc.joinPath(input.parent, nc.safeName(input.name));
      await nc.ensureFolder(path);
      return { path };
    }),

  /** Picker data for "who is this for?" — tenants, owners, properties. */
  parties: adminProcedure.query(async () => {
    const db = await requireDb();
    const [tenantRows, ownerRows, propertyRows] = await Promise.all([
      db
        .select({
          id: tenants.id,
          status: tenants.status,
          name: users.name,
          email: users.email,
          unitNumber: units.unitNumber,
          propertyId: units.propertyId,
          propertyName: properties.name,
        })
        .from(tenants)
        .leftJoin(users, eq(tenants.userId, users.id))
        .leftJoin(units, eq(tenants.unitId, units.id))
        .leftJoin(properties, eq(units.propertyId, properties.id)),
      db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.role, "owner")),
      db
        .select({ id: properties.id, name: properties.name, address: properties.address, ownerId: properties.ownerId })
        .from(properties),
    ]);
    return { tenants: tenantRows, owners: ownerRows, properties: propertyRows };
  }),

  /** Where a new upload should go: an explicit folder, or the folder of the tenant/owner/property it's for. */
  resolveFolder: adminProcedure
    .input(shareTarget.extend({ folder: z.string().optional() }))
    .mutation(async ({ input }) => {
      if (input.tenantId) return { folder: (await getTenantParty(input.tenantId)).folder };
      if (input.ownerUserId) return { folder: (await getOwnerParty(input.ownerUserId)).folder };
      if (input.propertyId) return { folder: (await getPropertyParty(input.propertyId)).folder };
      return { folder: nc.normalizePath(input.folder ?? "/") };
    }),

  /** Shares an uploaded Nextcloud file into a tenant/owner portal. */
  share: adminProcedure
    .input(
      shareTarget.extend({
        fileId: z.string().regex(/^\d+$/),
        path: z.string(),
        name: z.string().min(1).max(255),
        type: z.enum(DOCUMENT_TYPES),
        mimeType: z.string().optional(),
        size: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.tenantId && !input.ownerUserId && !input.propertyId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a tenant, owner, or property to share with." });
      }
      const id = await createDocumentRecord({
        name: input.name,
        type: input.type,
        nextcloudPath: nc.normalizePath(input.path),
        nextcloudFileId: input.fileId,
        mimeType: input.mimeType,
        sizeBytes: input.size,
        tenantId: input.tenantId,
        ownerUserId: input.ownerUserId,
        propertyId: input.propertyId,
        uploadedBy: ctx.user.id,
      });
      return { id };
    }),

  unshare: adminProcedure.input(z.object({ documentId: z.string() })).mutation(async ({ input }) => {
    const db = await requireDb();
    await db.delete(documents).where(eq(documents.id, input.documentId));
    return { success: true };
  }),
});
