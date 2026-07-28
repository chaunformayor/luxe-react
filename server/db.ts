import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ============ ADMIN QUERIES ============

import {
  properties,
  inquiries,
  maintenanceRequests,
  payments,
  tenants,
  units,
  invoices,
  subscriptions,
  documents,
  rentalApplications
} from "../drizzle/schema";
import { count, sum, and, gte, lte } from "drizzle-orm";

// Dashboard Statistics
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  try {
    const [totalPropertiesResult, totalTenantsResult, totalMaintenanceResult, totalPaymentsResult] = await Promise.all([
      db.select({ count: count() }).from(properties),
      db.select({ count: count() }).from(tenants),
      db.select({ count: count() }).from(maintenanceRequests).where(eq(maintenanceRequests.status, "open")),
      db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, "completed"))
    ]);

    return {
      totalProperties: totalPropertiesResult[0]?.count || 0,
      totalTenants: totalTenantsResult[0]?.count || 0,
      openMaintenanceRequests: totalMaintenanceResult[0]?.count || 0,
      totalRevenue: totalPaymentsResult[0]?.total || 0,
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard stats:", error);
    throw error;
  }
}

// Properties
export async function getAllProperties() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(properties);
  } catch (error) {
    console.error("[Database] Failed to get properties:", error);
    throw error;
  }
}

export async function getPropertyById(id: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get property:", error);
    throw error;
  }
}

export async function createProperty(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const id = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(properties).values({
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return id;
  } catch (error) {
    console.error("[Database] Failed to create property:", error);
    throw error;
  }
}

export async function updateProperty(id: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(properties).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(properties.id, id));
  } catch (error) {
    console.error("[Database] Failed to update property:", error);
    throw error;
  }
}

export async function deleteProperty(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(properties).where(eq(properties.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete property:", error);
    throw error;
  }
}

// Inquiries
export async function getAllInquiries() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(inquiries);
  } catch (error) {
    console.error("[Database] Failed to get inquiries:", error);
    throw error;
  }
}

export async function getInquiryById(id: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get inquiry:", error);
    throw error;
  }
}

export async function createInquiry(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const id = `inq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(inquiries).values({
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return id;
  } catch (error) {
    console.error("[Database] Failed to create inquiry:", error);
    throw error;
  }
}

export async function updateInquiry(id: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(inquiries).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(inquiries.id, id));
  } catch (error) {
    console.error("[Database] Failed to update inquiry:", error);
    throw error;
  }
}

// Maintenance Requests
export async function getAllMaintenanceRequests() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(maintenanceRequests);
  } catch (error) {
    console.error("[Database] Failed to get maintenance requests:", error);
    throw error;
  }
}

export async function getMaintenanceRequestById(id: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get maintenance request:", error);
    throw error;
  }
}

export async function updateMaintenanceRequest(id: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(maintenanceRequests).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(maintenanceRequests.id, id));
  } catch (error) {
    console.error("[Database] Failed to update maintenance request:", error);
    throw error;
  }
}

// Payments
export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(payments);
  } catch (error) {
    console.error("[Database] Failed to get payments:", error);
    throw error;
  }
}

export async function getPaymentById(id: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get payment:", error);
    throw error;
  }
}

// Tenants
export async function getAllTenants() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(tenants);
  } catch (error) {
    console.error("[Database] Failed to get tenants:", error);
    throw error;
  }
}

export async function getTenantById(id: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get tenant:", error);
    throw error;
  }
}

// Users
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(users);
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    throw error;
  }
}

export async function getUsersByRole(role: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(users).where(eq(users.role, role as any));
  } catch (error) {
    console.error("[Database] Failed to get users by role:", error);
    throw error;
  }
}

export async function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
  role: "tenant" | "owner" | "admin" | "user";
  mustChangePassword?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(users).values({
    id,
    email: data.email,
    name: data.name,
    passwordHash: data.passwordHash,
    role: data.role,
    mustChangePassword: data.mustChangePassword ?? false,
    loginMethod: "email",
    createdAt: new Date(),
    lastSignedIn: new Date(),
  });
  return id;
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, id));
}

export async function createTenant(data: {
  userId: string;
  unitId: string;
  leaseStartDate: Date;
  leaseEndDate: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `ten_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(tenants).values({
    id,
    userId: data.userId,
    unitId: data.unitId,
    leaseStartDate: data.leaseStartDate,
    leaseEndDate: data.leaseEndDate,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export async function getAllUnits() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: units.id,
      unitNumber: units.unitNumber,
      rentAmount: units.rentAmount,
      status: units.status,
      propertyId: units.propertyId,
      propertyName: properties.name,
      propertyAddress: properties.address,
    })
    .from(units)
    .leftJoin(properties, eq(units.propertyId, properties.id));
}

export async function markUnitOccupied(unitId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(units).set({ status: "occupied", updatedAt: new Date() }).where(eq(units.id, unitId));
}

export async function createUnit(data: {
  propertyId: string;
  unitNumber: string;
  rentAmount: string;
  status?: "vacant" | "occupied" | "maintenance";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(units).values({
    id,
    propertyId: data.propertyId,
    unitNumber: data.unitNumber,
    rentAmount: data.rentAmount,
    status: data.status ?? "vacant",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export async function updateUnit(id: string, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(units).set({ ...data, updatedAt: new Date() }).where(eq(units.id, id));
}

export async function deleteUnit(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(units).where(eq(units.id, id));
}

export async function getUnitsByProperty(propertyId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(units).where(eq(units.propertyId, propertyId));
}

export async function getUnitById(id: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(units).where(eq(units.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTenant(id: string, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tenants).set({ ...data, updatedAt: new Date() }).where(eq(tenants.id, id));
}

export async function getTenantByUnitId(unitId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(tenants).where(eq(tenants.unitId, unitId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createInvoice(data: {
  tenantId: string;
  unitId: string;
  amount: string;
  dueDate: Date;
  description?: string;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(invoices).values({
    id,
    tenantId: data.tenantId,
    unitId: data.unitId,
    amount: data.amount,
    dueDate: data.dueDate,
    description: data.description ?? null,
    status: data.status ?? "sent",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export async function getAllInvoices() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(invoices);
}

export async function updatePayment(id: string, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments).set({ ...data, updatedAt: new Date() }).where(eq(payments.id, id));
}


// ============ OWNER QUERIES ============

export async function getOwnerProperties(ownerId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(properties).where(eq(properties.ownerId, ownerId));
  } catch (error) {
    console.error("[Database] Failed to get owner properties:", error);
    throw error;
  }
}

export async function getOwnerTenants(ownerId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get tenants for properties owned by this owner
    const ownerProps = await db.select({ id: properties.id }).from(properties).where(eq(properties.ownerId, ownerId));
    const propIds = ownerProps.map(p => p.id);
    
    if (propIds.length === 0) return [];
    
    // For now, return all tenants - in production, would need proper join
    return await db.select().from(tenants);
  } catch (error) {
    console.error("[Database] Failed to get owner tenants:", error);
    throw error;
  }
}

export async function getOwnerPayments(ownerId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get payments for properties owned by this owner
    return await db.select().from(payments);
  } catch (error) {
    console.error("[Database] Failed to get owner payments:", error);
    throw error;
  }
}

export async function getOwnerInvoices(ownerId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get invoices for properties owned by this owner
    return await db.select().from(invoices);
  } catch (error) {
    console.error("[Database] Failed to get owner invoices:", error);
    throw error;
  }
}

export async function getOwnerMaintenanceRequests(ownerId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(maintenanceRequests);
  } catch (error) {
    console.error("[Database] Failed to get owner maintenance requests:", error);
    throw error;
  }
}

export async function getOwnerDocuments(ownerId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(documents);
  } catch (error) {
    console.error("[Database] Failed to get owner documents:", error);
    throw error;
  }
}

export async function getOwnerStats(ownerId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const [propsCount, tenantsCount, maintenanceCount, revenueResult] = await Promise.all([
      db.select({ count: count() }).from(properties).where(eq(properties.ownerId, ownerId)),
      db.select({ count: count() }).from(tenants),
      db.select({ count: count() }).from(maintenanceRequests),
      db.select({ total: sum(payments.amount) }).from(payments),
    ]);

    return {
      totalProperties: propsCount[0]?.count || 0,
      totalTenants: tenantsCount[0]?.count || 0,
      totalRevenue: revenueResult[0]?.total || 0,
      pendingMaintenance: maintenanceCount[0]?.count || 0,
    };
  } catch (error) {
    console.error("[Database] Failed to get owner stats:", error);
    throw error;
  }
}


// ============ TENANT QUERIES ============

export async function getTenantByUserId(userId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(tenants).where(eq(tenants.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get tenant by user ID:", error);
    throw error;
  }
}

export async function getTenantWithDetails(userId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select({
        id: tenants.id,
        userId: tenants.userId,
        unitId: tenants.unitId,
        leaseStartDate: tenants.leaseStartDate,
        leaseEndDate: tenants.leaseEndDate,
        status: tenants.status,
        unitNumber: units.unitNumber,
        rentAmount: units.rentAmount,
        propertyName: properties.name,
        propertyAddress: properties.address,
        propertyCity: properties.city,
        propertyState: properties.state,
      })
      .from(tenants)
      .leftJoin(units, eq(tenants.unitId, units.id))
      .leftJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(tenants.userId, userId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get tenant with details:", error);
    throw error;
  }
}

export async function getTenantPayments(tenantId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(payments).where(eq(payments.tenantId, tenantId));
  } catch (error) {
    console.error("[Database] Failed to get tenant payments:", error);
    throw error;
  }
}

export async function getTenantInvoices(tenantId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(invoices).where(eq(invoices.tenantId, tenantId));
  } catch (error) {
    console.error("[Database] Failed to get tenant invoices:", error);
    throw error;
  }
}

export async function getTenantMaintenanceRequests(tenantId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.tenantId, tenantId));
  } catch (error) {
    console.error("[Database] Failed to get tenant maintenance requests:", error);
    throw error;
  }
}

export async function createMaintenanceRequest(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const id = `maint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(maintenanceRequests).values({
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return id;
  } catch (error) {
    console.error("[Database] Failed to create maintenance request:", error);
    throw error;
  }
}

export async function getTenantDocuments(tenantId: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(documents).where(eq(documents.tenantId, tenantId));
  } catch (error) {
    console.error("[Database] Failed to get tenant documents:", error);
    throw error;
  }
}

// ============ RENTAL APPLICATION QUERIES ============

export async function createRentalApplication(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(rentalApplications).values({
    id,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export async function getRentalApplicationById(id: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(rentalApplications).where(eq(rentalApplications.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateRentalApplication(id: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(rentalApplications).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(rentalApplications.id, id));
}

export async function getAllRentalApplications() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(rentalApplications).orderBy(rentalApplications.createdAt);
}

export async function getTenantStats(tenantId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const [paymentsCount, invoicesCount, maintenanceCount] = await Promise.all([
      db.select({ count: count() }).from(payments).where(eq(payments.tenantId, tenantId)),
      db.select({ count: count() }).from(invoices).where(eq(invoices.tenantId, tenantId)),
      db.select({ count: count() }).from(maintenanceRequests).where(eq(maintenanceRequests.tenantId, tenantId)),
    ]);

    return {
      totalPayments: paymentsCount[0]?.count || 0,
      totalInvoices: invoicesCount[0]?.count || 0,
      totalMaintenanceRequests: maintenanceCount[0]?.count || 0,
    };
  } catch (error) {
    console.error("[Database] Failed to get tenant stats:", error);
    throw error;
  }
}
