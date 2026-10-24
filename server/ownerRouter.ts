import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getOwnerProperties,
  getOwnerTenants,
  getOwnerPayments,
  getOwnerInvoices,
  getOwnerMaintenanceRequests,
  getOwnerDocuments,
  getOwnerStats,
  getPropertyById,
  updateProperty,
  updateUser,
} from "./db";
import { hashPassword, verifyPassword } from "./authRoutes";
// Owner role check middleware
const ownerProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "owner" && opts.ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized: Owner access required" });
  }
  return opts.next();
});

/** Loads a property only if the signed-in owner owns it; another owner's property looks the same as a missing one. */
async function getOwnedProperty(ownerId: string, propertyId: string) {
  const property = await getPropertyById(propertyId);
  if (!property || property.ownerId !== ownerId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
  }
  return property;
}

export const ownerRouter = router({
  // Dashboard
  getStats: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerStats(ctx.user.id);
  }),

  // Properties
  getProperties: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerProperties(ctx.user.id);
  }),

  getPropertyById: ownerProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await getOwnedProperty(ctx.user.id, input);
  }),

  // Owners can only star their own listings. Listing content (name, price, photos, etc.) and
  // whether it shows on the public site (active) are managed by Luxe in the admin portal.
  updateProperty: ownerProcedure
    .input(z.object({ id: z.string(), featured: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await getOwnedProperty(ctx.user.id, input.id);
      await updateProperty(input.id, { featured: input.featured });
      return { success: true };
    }),

  // Tenants
  getTenants: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerTenants(ctx.user.id);
  }),

  // Payments
  getPayments: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerPayments(ctx.user.id);
  }),

  // Invoices
  getInvoices: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerInvoices(ctx.user.id);
  }),

  // Maintenance Requests
  getMaintenanceRequests: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerMaintenanceRequests(ctx.user.id);
  }),

  // Documents
  getDocuments: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerDocuments(ctx.user.id);
  }),
  // Account: update name
  updateProfile: ownerProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      await updateUser(ctx.user.id, { name: input.name });
      return { success: true };
    }),

  // Account: change password
  changePassword: ownerProcedure
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
});

export type OwnerRouter = typeof ownerRouter;
