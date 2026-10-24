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
  userLinks,
  deleteUser,
  syncPropertyTotals,
  getUnitById,
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
import { deliver, sendOwnerWelcomeEmail, sendTestEmail } from "./email";
import { PROPERTY_TYPE_VALUES, RENTAL_TYPE_VALUES, isMultifamily } from "../shared/propertyKinds";

const unitInput = z.object({
  unitNumber: z.string().trim().min(1),
  rentAmount: z.string().min(1),
  beds: z.number().int().min(0).nullable().optional(),
  baths: z.number().min(0).nullable().optional(),
  sqft: z.number().int().min(0).nullable().optional(),
  status: z.enum(["vacant", "occupied", "maintenance"]).optional(),
});

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
        propertyType: z.enum(PROPERTY_TYPE_VALUES).default("single_family"),
        rentalType: z.enum(RENTAL_TYPE_VALUES).default("long_term"),
        beds: z.number(),
        baths: z.number(),
        sqft: z.number(),
        description: z.string().optional(),
        amenities: z.string().optional(),
        images: z.string().optional(),
        featured: z.boolean().optional(),
        active: z.boolean().optional(),
        ownerId: z.string().optional(),
        // A multifamily's units, entered on the same form
        units: z.array(unitInput).max(200).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { units, ...data } = input;
      const id = await createProperty({
        ...data,
        createdBy: ctx.user.id,
      });
      if (units?.length && isMultifamily(data.propertyType)) {
        for (const unit of units) await createUnit({ propertyId: id, ...unit });
        await syncPropertyTotals(id);
      }
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
        propertyType: z.enum(PROPERTY_TYPE_VALUES).optional(),
        rentalType: z.enum(RENTAL_TYPE_VALUES).optional(),
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
      await syncPropertyTotals(id);
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

      const delivery =
        input.role === "owner"
          ? await deliver("Owner welcome email", () => sendOwnerWelcomeEmail({ to: input.email, name: input.name, tempPassword }))
          : null;

      return { id, tempPassword, success: true, emailed: delivery?.emailed ?? null, emailError: delivery?.emailError ?? null };
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

      const delivery = await deliver("Owner welcome email", () => sendOwnerWelcomeEmail({ to: input.email, name: input.name, tempPassword }));

      return { id, success: true, ...delivery };
    }),

  // Units
  getUnitsForProperty: adminProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await getUnitsByProperty(input);
    }),

  createUnit: adminProcedure
    .input(unitInput.extend({ propertyId: z.string() }))
    .mutation(async ({ input }) => {
      const id = await createUnit(input);
      await syncPropertyTotals(input.propertyId);
      return { id, success: true };
    }),

  updateUnit: adminProcedure
    .input(unitInput.partial().extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, baths, ...data } = input;
      await updateUnit(id, { ...data, ...(baths !== undefined ? { baths: baths === null ? null : String(baths) } : {}) });
      const unit = await getUnitById(id);
      if (unit) await syncPropertyTotals(unit.propertyId);
      return { success: true };
    }),

  deleteUnit: adminProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const unit = await getUnitById(input);
      await deleteUnit(input);
      if (unit) await syncPropertyTotals(unit.propertyId);
      return { success: true };
    }),

  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.id === ctx.user.id) throw new Error("You can't delete your own account.");
      const links = await userLinks(input.id);
      if (links.length) {
        throw new Error(
          `This account is linked to ${links.join(", ")}, so it can't be deleted. Change its role or reset its password instead.`
        );
      }
      await deleteUser(input.id);
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
