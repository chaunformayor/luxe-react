import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getDashboardStats,
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  getAllPayments,
  getPaymentById,
  getAllTenants,
  getTenantById,
  getAllUsers,
  getUsersByRole,
} from "./db";

// Admin role check middleware
const adminProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return opts.next();
});

export const adminRouter = router({
  // Dashboard
  getDashboardStats: adminProcedure.query(async () => {
    return await getDashboardStats();
  }),

  // Properties
  getAllProperties: adminProcedure.query(async () => {
    return await getAllProperties();
  }),

  getPropertyById: adminProcedure.input(z.string()).query(async ({ input }) => {
    return await getPropertyById(input);
  }),

  createProperty: adminProcedure
    .input(
      z.object({
        name: z.string(),
        address: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        price: z.string(),
        type: z.enum(["Rent", "Sale"]),
        beds: z.number(),
        baths: z.number(),
        sqft: z.number(),
        description: z.string().optional(),
        amenities: z.string().optional(),
        images: z.string().optional(),
        featured: z.boolean().optional(),
        ownerId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = await createProperty({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id };
    }),

  updateProperty: adminProcedure
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

  deleteProperty: adminProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await deleteProperty(input);
      return { success: true };
    }),

  // Inquiries
  getAllInquiries: adminProcedure.query(async () => {
    return await getAllInquiries();
  }),

  getInquiryById: adminProcedure.input(z.string()).query(async ({ input }) => {
    return await getInquiryById(input);
  }),

  updateInquiry: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["new", "contacted", "qualified", "closed"]).optional(),
        notes: z.string().optional(),
        assignedTo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateInquiry(id, data);
      return { success: true };
    }),

  // Maintenance Requests
  getAllMaintenanceRequests: adminProcedure.query(async () => {
    return await getAllMaintenanceRequests();
  }),

  getMaintenanceRequestById: adminProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await getMaintenanceRequestById(input);
    }),

  updateMaintenanceRequest: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["open", "in_progress", "completed", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedTo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateMaintenanceRequest(id, data);
      return { success: true };
    }),

  // Payments
  getAllPayments: adminProcedure.query(async () => {
    return await getAllPayments();
  }),

  getPaymentById: adminProcedure.input(z.string()).query(async ({ input }) => {
    return await getPaymentById(input);
  }),

  // Tenants
  getAllTenants: adminProcedure.query(async () => {
    return await getAllTenants();
  }),

  getTenantById: adminProcedure.input(z.string()).query(async ({ input }) => {
    return await getTenantById(input);
  }),

  // Users
  getAllUsers: adminProcedure.query(async () => {
    return await getAllUsers();
  }),

  getUsersByRole: adminProcedure
    .input(z.enum(["admin", "owner", "tenant", "user"]))
    .query(async ({ input }) => {
      return await getUsersByRole(input);
    }),
});

export type AdminRouter = typeof adminRouter;
