import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getTenantByUserId,
  getTenantWithDetails,
  getTenantPayments,
  getTenantInvoices,
  getTenantMaintenanceRequests,
  createMaintenanceRequest,
  getTenantDocuments,
  getTenantStats,
  getUnitById,
  updateUser,
} from "./db";
import { hashPassword, verifyPassword } from "./authRoutes";

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

  getLease: tenantProcedure.query(async ({ ctx }) => {
    return await getTenantWithDetails(ctx.user.id);
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
      if (!tenant) throw new Error("Tenant profile not found");
      if (!tenant.unitId) throw new Error("No unit assigned to your account. Contact your property manager.");

      // Look up the unit to get its propertyId
      const unit = await getUnitById(tenant.unitId);
      if (!unit?.propertyId) throw new Error("Unit has no property — contact your property manager.");

      const id = await createMaintenanceRequest({
        propertyId: unit.propertyId,
        tenantId: tenant.id,
        unitId: tenant.unitId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: "open",
      });

      return { id };
    }),

  // Account: update name
  updateProfile: tenantProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      await updateUser(ctx.user.id, { name: input.name });
      return { success: true };
    }),

  // Account: change password (requires current password verification)
  changePassword: tenantProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.passwordHash) throw new Error("No password set on this account.");
      const valid = await verifyPassword(input.currentPassword, ctx.user.passwordHash);
      if (!valid) throw new Error("Current password is incorrect.");
      const passwordHash = await hashPassword(input.newPassword);
      await updateUser(ctx.user.id, { passwordHash, mustChangePassword: false });
      return { success: true };
    }),

  // Documents
  getDocuments: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await getTenantByUserId(ctx.user.id);
    if (!tenant) return [];
    return await getTenantDocuments(tenant.id);
  }),
});

export type TenantRouter = typeof tenantRouter;
