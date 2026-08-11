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
  updatePayment,
  getAllTenants,
  getTenantById,
  getAllUsers,
  getUsersByRole,
  getUserByEmail,
  createUser,
  updateUser,
  createTenant,
  updateTenant,
  getAllUnits,
  markUnitOccupied,
  createUnit,
  updateUnit,
  deleteUnit,
  getUnitsByProperty,
  createInvoice,
  getAllInvoices,
  getAllBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "./db";
import { hashPassword } from "./authRoutes";
import { sendOwnerWelcomeEmail, sendTestEmail } from "./email";

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
        ownerId: z.string().optional().nullable(),
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

  // Users
  createUserAccount: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(["admin", "owner", "tenant", "user"]),
    }))
    .mutation(async ({ input }) => {
      const existing = await getUserByEmail(input.email.toLowerCase().trim());
      if (existing) throw new Error("An account with this email already exists.");

      const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
      const tempPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const passwordHash = await hashPassword(tempPassword);

      const id = await createUser({
        email: input.email.toLowerCase().trim(),
        name: input.name,
        passwordHash,
        role: input.role,
        mustChangePassword: true,
      });

      if (input.role === "owner") {
        sendOwnerWelcomeEmail({ to: input.email, name: input.name, tempPassword })
          .catch(err => console.error("[Email] Failed to send owner welcome email:", err));
      }

      return { id, tempPassword, success: true };
    }),

  // Owners (kept for backwards compat)
  createOwner: adminProcedure
    .input(z.object({ name: z.string().min(1), email: z.string().email() }))
    .mutation(async ({ input }) => {
      const existing = await getUserByEmail(input.email.toLowerCase().trim());
      if (existing) throw new Error("An account with this email already exists.");

      const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
      const tempPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const passwordHash = await hashPassword(tempPassword);

      const id = await createUser({
        email: input.email.toLowerCase().trim(),
        name: input.name,
        passwordHash,
        role: "owner",
        mustChangePassword: true,
      });

      sendOwnerWelcomeEmail({ to: input.email, name: input.name, tempPassword })
        .catch(err => console.error("[Email] Failed to send owner welcome email:", err));

      return { id, success: true };
    }),

  // Units
  getUnitsForProperty: adminProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await getUnitsByProperty(input);
    }),

  createUnit: adminProcedure
    .input(z.object({
      propertyId: z.string(),
      unitNumber: z.string().min(1),
      rentAmount: z.string().min(1),
      status: z.enum(["vacant", "occupied", "maintenance"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await createUnit(input);
      return { id, success: true };
    }),

  updateUnit: adminProcedure
    .input(z.object({
      id: z.string(),
      unitNumber: z.string().optional(),
      rentAmount: z.string().optional(),
      status: z.enum(["vacant", "occupied", "maintenance"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateUnit(id, data);
      return { success: true };
    }),

  deleteUnit: adminProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await deleteUnit(input);
      return { success: true };
    }),

  // Update user details (name, email, role, reset password)
  updateUser: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      role: z.enum(["admin", "owner", "tenant", "user"]).optional(),
      resetPassword: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, resetPassword, ...fields } = input;
      const updateData: Record<string, unknown> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.email !== undefined) updateData.email = fields.email.toLowerCase().trim();
      if (fields.role !== undefined) updateData.role = fields.role;

      let tempPassword: string | undefined;
      if (resetPassword) {
        const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
        tempPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        updateData.passwordHash = await hashPassword(tempPassword);
        updateData.mustChangePassword = true;
      }

      await updateUser(id, updateData);
      return { success: true, tempPassword };
    }),

  // Get all units (for tenant assignment)
  getAllUnitsAdmin: adminProcedure.query(async () => {
    return await getAllUnits();
  }),

  // Link a user to a unit as a tenant
  createTenantRecord: adminProcedure
    .input(z.object({
      userId: z.string(),
      unitId: z.string(),
      leaseStartDate: z.string(),
      leaseEndDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const id = await createTenant({
        userId: input.userId,
        unitId: input.unitId,
        leaseStartDate: new Date(input.leaseStartDate),
        leaseEndDate: new Date(input.leaseEndDate),
      });
      await markUnitOccupied(input.unitId);
      await updateUser(input.userId, { role: "tenant" });
      return { id, success: true };
    }),

  // Update a tenant record (lease dates, status)
  updateTenantRecord: adminProcedure
    .input(z.object({
      id: z.string(),
      leaseStartDate: z.string().optional(),
      leaseEndDate: z.string().optional(),
      status: z.enum(["active", "inactive", "evicted"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, leaseStartDate, leaseEndDate, ...rest } = input;
      const data: Record<string, unknown> = { ...rest };
      if (leaseStartDate) data.leaseStartDate = new Date(leaseStartDate);
      if (leaseEndDate) data.leaseEndDate = new Date(leaseEndDate);
      await updateTenant(id, data);
      return { success: true };
    }),

  // Invoices
  getAllInvoices: adminProcedure.query(async () => {
    return await getAllInvoices();
  }),

  createInvoice: adminProcedure
    .input(z.object({
      tenantId: z.string(),
      unitId: z.string(),
      amount: z.string(),
      dueDate: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await createInvoice({
        tenantId: input.tenantId,
        unitId: input.unitId,
        amount: input.amount,
        dueDate: new Date(input.dueDate),
        description: input.description,
      });
      return { id, success: true };
    }),

  // Mark payment as received
  markPaymentReceived: adminProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await updatePayment(input, { status: "completed" });
      return { success: true };
    }),

  // Blog Posts
  getBlogPosts: adminProcedure.query(async () => {
    return await getAllBlogPosts();
  }),

  getBlogPost: adminProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await getBlogPostById(input);
    }),

  createBlogPost: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      excerpt: z.string().optional(),
      body: z.string().min(1),
      coverImageUrl: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(["draft", "published"]),
    }))
    .mutation(async ({ input }) => {
      const id = await createBlogPost(input);
      return { id, success: true };
    }),

  updateBlogPost: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      excerpt: z.string().nullable().optional(),
      body: z.string().min(1).optional(),
      coverImageUrl: z.string().nullable().optional(),
      category: z.string().nullable().optional(),
      status: z.enum(["draft", "published"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateBlogPost(id, data as any);
      return { success: true };
    }),

  deleteBlogPost: adminProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await deleteBlogPost(input);
      return { success: true };
    }),

  testEmail: adminProcedure
    .input(z.object({ to: z.string().email() }))
    .mutation(async ({ input }) => {
      return await sendTestEmail(input.to);
    }),

  seedTestAccounts: adminProcedure.mutation(async () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    const genPw = () => Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    const results: Record<string, { email: string; password: string; created: boolean }> = {};

    // Test owner
    const ownerEmail = "test.owner@luxestl.com";
    const existingOwner = await getUserByEmail(ownerEmail);
    if (!existingOwner) {
      const ownerPw = genPw();
      await createUser({
        email: ownerEmail,
        name: "Test Owner",
        passwordHash: await hashPassword(ownerPw),
        role: "owner",
        mustChangePassword: false,
      });
      results.owner = { email: ownerEmail, password: ownerPw, created: true };
    } else {
      results.owner = { email: ownerEmail, password: "(already exists)", created: false };
    }

    // Test tenant
    const tenantEmail = "test.tenant@luxestl.com";
    const existingTenant = await getUserByEmail(tenantEmail);
    if (!existingTenant) {
      const tenantPw = genPw();
      const userId = await createUser({
        email: tenantEmail,
        name: "Test Tenant",
        passwordHash: await hashPassword(tenantPw),
        role: "tenant",
        mustChangePassword: false,
      });

      // Link to first available unit if any
      const allUnits = await getAllUnits();
      const firstUnit = allUnits[0];
      if (firstUnit) {
        await createTenant({
          userId,
          unitId: firstUnit.id,
          leaseStartDate: new Date(),
          leaseEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
      }

      results.tenant = { email: tenantEmail, password: tenantPw, created: true };
    } else {
      results.tenant = { email: tenantEmail, password: "(already exists)", created: false };
    }

    return results;
  }),
});

export type AdminRouter = typeof adminRouter;
