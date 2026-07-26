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
} from "./db";

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
});

export type OwnerRouter = typeof ownerRouter;
