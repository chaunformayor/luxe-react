import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getTenantByUserId,
  getTenantPayments,
  getTenantInvoices,
  getTenantMaintenanceRequests,
  createMaintenanceRequest,
  getTenantDocuments,
  getTenantStats,
} from "./db";

// Tenant role check middleware
const tenantProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "tenant" && opts.ctx.user?.role !== "admin") {
    throw new Error("Unauthorized: Tenant access required");
  }
  return opts.next();
});

export const tenantRouter = router({
  // Dashboard
  getStats: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await getTenantByUserId(ctx.user.id);
    if (!tenant) {
      return {
        totalPayments: 0,
        totalInvoices: 0,
        totalMaintenanceRequests: 0,
      };
    }
    return await getTenantStats(tenant.id);
  }),

  // Tenant Info
  getTenantInfo: tenantProcedure.query(async ({ ctx }) => {
    return await getTenantByUserId(ctx.user.id);
  }),

  // Payments
  getPayments: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await getTenantByUserId(ctx.user.id);
    if (!tenant) return [];
    return await getTenantPayments(tenant.id);
  }),

  // Invoices
  getInvoices: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await getTenantByUserId(ctx.user.id);
    if (!tenant) return [];
    return await getTenantInvoices(tenant.id);
  }),

  // Maintenance Requests
  getMaintenanceRequests: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await getTenantByUserId(ctx.user.id);
    if (!tenant) return [];
    return await getTenantMaintenanceRequests(tenant.id);
  }),

  createMaintenanceRequest: tenantProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenant = await getTenantByUserId(ctx.user.id);
      if (!tenant) {
        throw new Error("Tenant profile not found");
      }

      const id = await createMaintenanceRequest({
        propertyId: tenant.unitId, // Using unitId as propertyId for now
        tenantId: tenant.id,
        unitId: tenant.unitId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: "open",
      });

      return { id };
    }),

  // Documents
  getDocuments: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await getTenantByUserId(ctx.user.id);
    if (!tenant) return [];
    return await getTenantDocuments(tenant.id);
  }),
});

export type TenantRouter = typeof tenantRouter;
