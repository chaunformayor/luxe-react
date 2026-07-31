import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getOwnerProperties,
  getOwnerTenants,
  getOwnerPayments,
  getOwnerInvoices,
  getOwnerMaintenanceRequests,
  getOwnerDocuments,
  getOwnerStats,
  updateProperty,
  updateUser,
} from "./db";
import { hashPassword, verifyPassword } from "./authRoutes";

// Owner role check middleware
const ownerProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "owner" && opts.ctx.user?.role !== "admin") {
    throw new Error("Unauthorized: Owner access required");
  }
  return opts.next();
});

export const ownerRouter = router({
  // Dashboard
  getStats: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerStats(ctx.user.id);
  }),

  // Properties
  getProperties: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerProperties(ctx.user.id);
  }),

  getPropertyById: ownerProcedure.input(z.string()).query(async ({ input }) => {
    // In production, verify ownership
    return await getOwnerProperties(input);
  }),

  updateProperty: ownerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        price: z.string().optional(),
        type: z.enum(["Rent", "Sale"]).optional(),
        beds: z.number().optional(),
        baths: z.number().optional(),
        sqft: z.number().optional(),
        description: z.string().optional(),
        amenities: z.string().optional(),
        images: z.string().optional(),
        featured: z.boolean().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProperty(id, data);
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
