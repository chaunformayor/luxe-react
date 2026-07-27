// server-entry.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/authRoutes.ts
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, decimal, boolean, json } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "owner", "tenant"]).default("user").notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  mustChangePassword: boolean("mustChangePassword").default(false),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow()
});
var properties = mysqlTable("properties", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["Rent", "Sale"]).notNull(),
  beds: int("beds").notNull(),
  baths: decimal("baths", { precision: 3, scale: 1 }).notNull(),
  sqft: int("sqft").notNull(),
  description: text("description"),
  amenities: text("amenities"),
  // JSON array stored as text
  images: text("images"),
  // JSON array of image URLs
  featured: boolean("featured").default(false),
  active: boolean("active").default(true),
  ownerId: varchar("ownerId", { length: 64 }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 64 }).references(() => users.id)
});
var units = mysqlTable("units", {
  id: varchar("id", { length: 64 }).primaryKey(),
  propertyId: varchar("propertyId", { length: 64 }).notNull().references(() => properties.id),
  unitNumber: varchar("unitNumber", { length: 50 }).notNull(),
  rentAmount: decimal("rentAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["vacant", "occupied", "maintenance"]).default("vacant"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var tenants = mysqlTable("tenants", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).references(() => users.id),
  unitId: varchar("unitId", { length: 64 }).references(() => units.id),
  leaseStartDate: timestamp("leaseStartDate"),
  leaseEndDate: timestamp("leaseEndDate"),
  status: mysqlEnum("status", ["active", "inactive", "evicted"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var inquiries = mysqlTable("inquiries", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  propertyType: varchar("propertyType", { length: 50 }),
  message: text("message"),
  propertyId: varchar("propertyId", { length: 64 }).references(() => properties.id),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "closed"]).default("new"),
  notes: text("notes"),
  assignedTo: varchar("assignedTo", { length: 64 }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var maintenanceRequests = mysqlTable("maintenanceRequests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  propertyId: varchar("propertyId", { length: 64 }).notNull().references(() => properties.id),
  unitId: varchar("unitId", { length: 64 }).references(() => units.id),
  tenantId: varchar("tenantId", { length: 64 }).references(() => tenants.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  status: mysqlEnum("status", ["open", "in_progress", "completed", "closed"]).default("open"),
  assignedTo: varchar("assignedTo", { length: 64 }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var payments = mysqlTable("payments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  tenantId: varchar("tenantId", { length: 64 }).references(() => tenants.id),
  unitId: varchar("unitId", { length: 64 }).references(() => units.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  paymentMethod: mysqlEnum("paymentMethod", ["stripe", "bank_transfer", "check", "cash"]).default("stripe"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id),
  unitId: varchar("unitId", { length: 64 }).notNull().references(() => units.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidDate: timestamp("paidDate"),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id),
  unitId: varchar("unitId", { length: 64 }).notNull().references(() => units.id),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: mysqlEnum("frequency", ["monthly", "quarterly", "yearly"]).default("monthly"),
  status: mysqlEnum("status", ["active", "paused", "cancelled"]).default("active"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var documents = mysqlTable("documents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["lease", "inspection", "maintenance", "invoice", "other"]).notNull(),
  url: text("url").notNull(),
  propertyId: varchar("propertyId", { length: 64 }).references(() => properties.id),
  unitId: varchar("unitId", { length: 64 }).references(() => units.id),
  tenantId: varchar("tenantId", { length: 64 }).references(() => tenants.id),
  uploadedBy: varchar("uploadedBy", { length: 64 }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var rentalApplications = mysqlTable("rentalApplications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  // Property of interest
  propertyId: varchar("propertyId", { length: 64 }).references(() => properties.id),
  propertyAddress: text("propertyAddress"),
  // Personal information
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  dateOfBirth: varchar("dateOfBirth", { length: 20 }).notNull(),
  ssn: varchar("ssn", { length: 20 }),
  // last 4 digits only for display
  // Current address
  currentAddress: text("currentAddress").notNull(),
  currentCity: varchar("currentCity", { length: 100 }).notNull(),
  currentState: varchar("currentState", { length: 2 }).notNull(),
  currentZip: varchar("currentZip", { length: 10 }).notNull(),
  currentLengthOfResidence: varchar("currentLengthOfResidence", { length: 50 }),
  currentLandlordName: varchar("currentLandlordName", { length: 255 }),
  currentLandlordPhone: varchar("currentLandlordPhone", { length: 20 }),
  currentMonthlyRent: varchar("currentMonthlyRent", { length: 20 }),
  reasonForLeaving: text("reasonForLeaving"),
  // Employment
  employmentStatus: mysqlEnum("employmentStatus", ["employed", "self_employed", "unemployed", "retired", "student"]).notNull(),
  employerName: varchar("employerName", { length: 255 }),
  employerPhone: varchar("employerPhone", { length: 20 }),
  employerAddress: text("employerAddress"),
  jobTitle: varchar("jobTitle", { length: 255 }),
  monthsEmployed: int("monthsEmployed"),
  monthlyIncome: varchar("monthlyIncome", { length: 20 }),
  additionalIncome: varchar("additionalIncome", { length: 20 }),
  additionalIncomeSource: text("additionalIncomeSource"),
  // References (JSON)
  references: json("references"),
  // [{name, phone, relationship}]
  // Additional occupants (JSON)
  additionalOccupants: json("additionalOccupants"),
  // [{name, age, relationship}]
  // Pets
  hasPets: boolean("hasPets").default(false),
  petDetails: text("petDetails"),
  // Background questions
  hasEviction: boolean("hasEviction").default(false),
  evictionDetails: text("evictionDetails"),
  hasCriminalHistory: boolean("hasCriminalHistory").default(false),
  criminalDetails: text("criminalDetails"),
  hasBankruptcy: boolean("hasBankruptcy").default(false),
  bankruptcyDetails: text("bankruptcyDetails"),
  // Voucher / Housing Assistance
  hasVoucher: boolean("hasVoucher").default(false),
  voucherType: mysqlEnum("voucherType", ["section8_hcv", "vash", "other"]),
  phaName: varchar("phaName", { length: 255 }),
  phaPhone: varchar("phaPhone", { length: 20 }),
  phaEmail: varchar("phaEmail", { length: 320 }),
  voucherNumber: varchar("voucherNumber", { length: 100 }),
  voucherAmount: varchar("voucherAmount", { length: 20 }),
  voucherBedrooms: varchar("voucherBedrooms", { length: 10 }),
  voucherExpirationDate: varchar("voucherExpirationDate", { length: 20 }),
  // Payment & status
  applicationFee: decimal("applicationFee", { precision: 8, scale: 2 }).default("75.00"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "refunded"]).default("pending"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeClientSecret: varchar("stripeClientSecret", { length: 512 }),
  // Review status
  status: mysqlEnum("status", ["incomplete", "submitted", "under_review", "approved", "denied", "withdrawn"]).default("incomplete"),
  reviewNotes: text("reviewNotes"),
  reviewedBy: varchar("reviewedBy", { length: 64 }).references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  read: boolean("read").default(false),
  createdAt: timestamp("createdAt").defaultNow()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePublishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "",
  applicationFeeAmount: 7500
  // $75.00 in cents
};

// server/db.ts
import { count, sum } from "drizzle-orm";
var _db = null;
async function getDb() {
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
async function getUser(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getDashboardStats() {
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
      totalRevenue: totalPaymentsResult[0]?.total || 0
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard stats:", error);
    throw error;
  }
}
async function getAllProperties() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(properties);
  } catch (error) {
    console.error("[Database] Failed to get properties:", error);
    throw error;
  }
}
async function getPropertyById(id) {
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
async function createProperty(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const id = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(properties).values({
      id,
      ...data,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    return id;
  } catch (error) {
    console.error("[Database] Failed to create property:", error);
    throw error;
  }
}
async function updateProperty(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(properties).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(properties.id, id));
  } catch (error) {
    console.error("[Database] Failed to update property:", error);
    throw error;
  }
}
async function deleteProperty(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(properties).where(eq(properties.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete property:", error);
    throw error;
  }
}
async function getAllInquiries() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(inquiries);
  } catch (error) {
    console.error("[Database] Failed to get inquiries:", error);
    throw error;
  }
}
async function getInquiryById(id) {
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
async function createInquiry(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const id = `inq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(inquiries).values({
      id,
      ...data,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    return id;
  } catch (error) {
    console.error("[Database] Failed to create inquiry:", error);
    throw error;
  }
}
async function updateInquiry(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(inquiries).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(inquiries.id, id));
  } catch (error) {
    console.error("[Database] Failed to update inquiry:", error);
    throw error;
  }
}
async function getAllMaintenanceRequests() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(maintenanceRequests);
  } catch (error) {
    console.error("[Database] Failed to get maintenance requests:", error);
    throw error;
  }
}
async function getMaintenanceRequestById(id) {
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
async function updateMaintenanceRequest(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(maintenanceRequests).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(maintenanceRequests.id, id));
  } catch (error) {
    console.error("[Database] Failed to update maintenance request:", error);
    throw error;
  }
}
async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(payments);
  } catch (error) {
    console.error("[Database] Failed to get payments:", error);
    throw error;
  }
}
async function getPaymentById(id) {
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
async function getAllTenants() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(tenants);
  } catch (error) {
    console.error("[Database] Failed to get tenants:", error);
    throw error;
  }
}
async function getTenantById(id) {
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
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    throw error;
  }
}
async function getUsersByRole(role) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(users).where(eq(users.role, role));
  } catch (error) {
    console.error("[Database] Failed to get users by role:", error);
    throw error;
  }
}
async function createUser(data) {
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
    createdAt: /* @__PURE__ */ new Date(),
    lastSignedIn: /* @__PURE__ */ new Date()
  });
  return id;
}
async function updateUser(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, id));
}
async function createTenant(data) {
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
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
  return id;
}
async function getAllUnits() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: units.id,
    unitNumber: units.unitNumber,
    rentAmount: units.rentAmount,
    status: units.status,
    propertyId: units.propertyId,
    propertyName: properties.name,
    propertyAddress: properties.address
  }).from(units).leftJoin(properties, eq(units.propertyId, properties.id));
}
async function markUnitOccupied(unitId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(units).set({ status: "occupied", updatedAt: /* @__PURE__ */ new Date() }).where(eq(units.id, unitId));
}
async function createUnit(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const id = `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(units).values({
    id,
    propertyId: data.propertyId,
    unitNumber: data.unitNumber,
    rentAmount: data.rentAmount,
    status: data.status ?? "vacant",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
  return id;
}
async function updateUnit(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(units).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(units.id, id));
}
async function deleteUnit(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(units).where(eq(units.id, id));
}
async function getUnitsByProperty(propertyId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(units).where(eq(units.propertyId, propertyId));
}
async function getOwnerProperties(ownerId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(properties).where(eq(properties.ownerId, ownerId));
  } catch (error) {
    console.error("[Database] Failed to get owner properties:", error);
    throw error;
  }
}
async function getOwnerTenants(ownerId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const ownerProps = await db.select({ id: properties.id }).from(properties).where(eq(properties.ownerId, ownerId));
    const propIds = ownerProps.map((p) => p.id);
    if (propIds.length === 0) return [];
    return await db.select().from(tenants);
  } catch (error) {
    console.error("[Database] Failed to get owner tenants:", error);
    throw error;
  }
}
async function getOwnerPayments(ownerId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(payments);
  } catch (error) {
    console.error("[Database] Failed to get owner payments:", error);
    throw error;
  }
}
async function getOwnerInvoices(ownerId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(invoices);
  } catch (error) {
    console.error("[Database] Failed to get owner invoices:", error);
    throw error;
  }
}
async function getOwnerMaintenanceRequests(ownerId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(maintenanceRequests);
  } catch (error) {
    console.error("[Database] Failed to get owner maintenance requests:", error);
    throw error;
  }
}
async function getOwnerDocuments(ownerId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(documents);
  } catch (error) {
    console.error("[Database] Failed to get owner documents:", error);
    throw error;
  }
}
async function getOwnerStats(ownerId) {
  const db = await getDb();
  if (!db) return null;
  try {
    const [propsCount, tenantsCount, maintenanceCount, revenueResult] = await Promise.all([
      db.select({ count: count() }).from(properties).where(eq(properties.ownerId, ownerId)),
      db.select({ count: count() }).from(tenants),
      db.select({ count: count() }).from(maintenanceRequests),
      db.select({ total: sum(payments.amount) }).from(payments)
    ]);
    return {
      totalProperties: propsCount[0]?.count || 0,
      totalTenants: tenantsCount[0]?.count || 0,
      totalRevenue: revenueResult[0]?.total || 0,
      pendingMaintenance: maintenanceCount[0]?.count || 0
    };
  } catch (error) {
    console.error("[Database] Failed to get owner stats:", error);
    throw error;
  }
}
async function getTenantByUserId(userId) {
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
async function getTenantWithDetails(userId) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select({
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
      propertyState: properties.state
    }).from(tenants).leftJoin(units, eq(tenants.unitId, units.id)).leftJoin(properties, eq(units.propertyId, properties.id)).where(eq(tenants.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get tenant with details:", error);
    throw error;
  }
}
async function getTenantPayments(tenantId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(payments).where(eq(payments.tenantId, tenantId));
  } catch (error) {
    console.error("[Database] Failed to get tenant payments:", error);
    throw error;
  }
}
async function getTenantInvoices(tenantId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(invoices).where(eq(invoices.tenantId, tenantId));
  } catch (error) {
    console.error("[Database] Failed to get tenant invoices:", error);
    throw error;
  }
}
async function getTenantMaintenanceRequests(tenantId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.tenantId, tenantId));
  } catch (error) {
    console.error("[Database] Failed to get tenant maintenance requests:", error);
    throw error;
  }
}
async function createMaintenanceRequest(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const id = `maint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(maintenanceRequests).values({
      id,
      ...data,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    return id;
  } catch (error) {
    console.error("[Database] Failed to create maintenance request:", error);
    throw error;
  }
}
async function getTenantDocuments(tenantId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(documents).where(eq(documents.tenantId, tenantId));
  } catch (error) {
    console.error("[Database] Failed to get tenant documents:", error);
    throw error;
  }
}
async function createRentalApplication(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const id = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(rentalApplications).values({
    id,
    ...data,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
  return id;
}
async function getRentalApplicationById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(rentalApplications).where(eq(rentalApplications.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function updateRentalApplication(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(rentalApplications).set({
    ...data,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(rentalApplications.id, id));
}
async function getAllRentalApplications() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(rentalApplications).orderBy(rentalApplications.createdAt);
}
async function getTenantStats(tenantId) {
  const db = await getDb();
  if (!db) return null;
  try {
    const [paymentsCount, invoicesCount, maintenanceCount] = await Promise.all([
      db.select({ count: count() }).from(payments).where(eq(payments.tenantId, tenantId)),
      db.select({ count: count() }).from(invoices).where(eq(invoices.tenantId, tenantId)),
      db.select({ count: count() }).from(maintenanceRequests).where(eq(maintenanceRequests.tenantId, tenantId))
    ]);
    return {
      totalPayments: paymentsCount[0]?.count || 0,
      totalInvoices: invoicesCount[0]?.count || 0,
      totalMaintenanceRequests: maintenanceCount[0]?.count || 0
    };
  } catch (error) {
    console.error("[Database] Failed to get tenant stats:", error);
    throw error;
  }
}

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a user ID
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.id);
   */
  async createSessionToken(userId, options = {}) {
    return this.signSession(
      {
        openId: userId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId)) {
        console.warn("[Auth] Session payload missing openId");
        return null;
      }
      return {
        openId,
        appId: typeof appId === "string" ? appId : "",
        name: typeof name === "string" ? name : ""
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const user = await getUser(session.openId);
    if (!user) {
      throw ForbiddenError("User not found");
    }
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // "none" requires Secure=true; on HTTP (localhost) the browser drops it silently.
    // "lax" works for same-origin API calls on both HTTP and HTTPS.
    sameSite: secure ? "none" : "lax",
    secure
  };
}

// server/authRoutes.ts
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function verifyPassword(password, hash) {
  const [hashed, salt] = hash.split(".");
  if (!hashed || !salt) return false;
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(password, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function registerAuthRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const user = await getUserByEmail(email.toLowerCase().trim());
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const sessionToken = await sdk.createSessionToken(user.id, {
      name: user.name || "",
      expiresInMs: ONE_YEAR_MS
    });
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.json({ ok: true, role: user.role, name: user.name });
  });
  app2.post("/api/auth/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ ok: true });
  });
  app2.get("/api/auth/me", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword ?? false
      });
    } catch {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
  app2.post("/api/auth/change-password", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters" });
        return;
      }
      const passwordHash = await hashPassword(newPassword);
      await updateUser(user.id, { passwordHash, mustChangePassword: false });
      res.json({ ok: true });
    } catch {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
}

// server/routers.ts
import { z as z6 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Notification] Notification service not configured \u2014 skipping.");
    return false;
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/adminRouter.ts
import { z as z2 } from "zod";

// server/email.ts
var MAILEROO_ENDPOINT = "https://smtp.maileroo.com/api/v2/emails";
var FROM_NAME = "Luxe Property Solutions";
function getFromEmail() {
  return process.env.MAILEROO_FROM_EMAIL || "noreply@luxestl.com";
}
async function callMaileroo(apiKey, opts) {
  const payload = {
    from: { address: getFromEmail(), display_name: FROM_NAME },
    to: [{ address: opts.to, display_name: opts.toName }],
    subject: opts.subject,
    html: opts.html
  };
  const res = await fetch(MAILEROO_ENDPOINT, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  let body;
  try {
    body = await res.json();
  } catch {
    body = await res.text().catch(() => "(unreadable)");
  }
  return { success: res.ok, status: res.status, body };
}
async function sendEmail(opts) {
  const apiKey = process.env.MAILEROO_API_KEY;
  if (!apiKey) {
    console.warn("[Email] MAILEROO_API_KEY not set \u2014 skipping email");
    return;
  }
  const result = await callMaileroo(apiKey, opts);
  if (!result.success) {
    throw new Error(`Maileroo (${result.status}): ${result.body?.message || JSON.stringify(result.body)}`);
  }
}
async function sendTestEmail(to) {
  const apiKey = process.env.MAILEROO_API_KEY;
  const fromEmail = getFromEmail();
  if (!apiKey) {
    return { apiKeySet: false, fromEmail, to, error: "MAILEROO_API_KEY env var is not set on the server" };
  }
  try {
    const result = await callMaileroo(apiKey, {
      to,
      toName: "Luxe Admin",
      subject: "Luxe Property Solutions \u2014 Test Email",
      html: `<p style="font-family:Arial;font-size:15px;">This is a test email from <strong>Luxe Property Solutions</strong>.<br>If you received this, Maileroo is configured correctly.</p>`
    });
    return { apiKeySet: true, fromEmail, to, httpStatus: result.status, responseBody: result.body };
  } catch (err) {
    return { apiKeySet: true, fromEmail, to, error: err.message };
  }
}
async function sendOwnerWelcomeEmail({
  to,
  name,
  tempPassword
}) {
  await sendEmail({
    to,
    toName: name,
    subject: "Welcome to Your Luxe Owner Portal",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#0A1628;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#C9A84C;font-size:26px;font-weight:700;">Luxe Property Solutions</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">Property Owner Portal</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#0A1628;font-size:22px;">Welcome, ${name}!</h2>
            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
              Your owner account has been created. Log in to manage your properties and track tenant activity.
            </p>
            <div style="background:#0A1628;border-radius:8px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 16px;color:#C9A84C;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your Login Credentials</p>
              <p style="margin:0 0 8px;color:#e2e8f0;font-size:14px;"><span style="color:#94a3b8;">Email:</span> ${to}</p>
              <p style="margin:0;color:#e2e8f0;font-size:14px;"><span style="color:#94a3b8;">Temp Password:</span> <strong style="color:#C9A84C;">${tempPassword}</strong></p>
            </div>
            <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">You will be prompted to create a new password on your first login.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="https://luxe-react.vercel.app/owner-login"
                 style="display:inline-block;background:#C9A84C;color:#0A1628;font-weight:700;font-size:15px;padding:14px 32px;border-radius:6px;text-decoration:none;">
                Sign In to Owner Portal
              </a>
            </div>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
              Need help? Contact <a href="mailto:info@luxestl.com" style="color:#C9A84C;">info@luxestl.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">\xA9 2026 Luxe Property Solutions \xB7 St. Louis, MO</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  });
}
async function sendWelcomeEmail({
  to,
  name,
  tempPassword,
  unitAddress
}) {
  await sendEmail({
    to,
    toName: name,
    subject: "Welcome to Your Luxe Tenant Portal",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#0A1628;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#C9A84C;font-size:26px;font-weight:700;">Luxe Property Solutions</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">Tenant Portal Access</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#0A1628;font-size:22px;">Welcome, ${name}!</h2>
            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
              Your rental application has been approved. Your tenant portal account is ready.
            </p>
            <div style="background:#f8f9fa;border-left:4px solid #C9A84C;padding:16px 20px;border-radius:0 6px 6px 0;margin-bottom:28px;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your Unit</p>
              <p style="margin:6px 0 0;color:#0A1628;font-size:16px;font-weight:600;">${unitAddress}</p>
            </div>
            <div style="background:#0A1628;border-radius:8px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 16px;color:#C9A84C;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your Login Credentials</p>
              <p style="margin:0 0 8px;color:#e2e8f0;font-size:14px;"><span style="color:#94a3b8;">Email:</span> ${to}</p>
              <p style="margin:0;color:#e2e8f0;font-size:14px;"><span style="color:#94a3b8;">Temp Password:</span> <strong style="color:#C9A84C;">${tempPassword}</strong></p>
            </div>
            <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">You will be prompted to create a new password on your first login.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="https://luxe-react.vercel.app/login"
                 style="display:inline-block;background:#C9A84C;color:#0A1628;font-weight:700;font-size:15px;padding:14px 32px;border-radius:6px;text-decoration:none;">
                Sign In to Your Portal
              </a>
            </div>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
              Need help? <a href="mailto:info@luxestl.com" style="color:#C9A84C;">info@luxestl.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">\xA9 2026 Luxe Property Solutions \xB7 St. Louis, MO</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  });
}
async function sendContactNotificationEmail({
  fromName,
  fromEmail,
  phone,
  propertyType,
  message
}) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "info@luxestl.com";
  await sendEmail({
    to: adminEmail,
    toName: "Luxe Property Solutions",
    subject: `New Contact Form Submission from ${fromName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr>
          <td style="background:#0A1628;padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#C9A84C;font-size:22px;font-weight:700;">New Contact Inquiry</h1>
            <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">Luxe Property Solutions</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:16px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">From</p>
                  <p style="margin:0;color:#0A1628;font-size:15px;font-weight:600;">${fromName}</p>
                  <p style="margin:4px 0 0;color:#4b5563;font-size:14px;">${fromEmail}</p>
                  ${phone ? `<p style="margin:4px 0 0;color:#4b5563;font-size:14px;">${phone}</p>` : ""}
                  ${propertyType ? `<p style="margin:4px 0 0;color:#4b5563;font-size:13px;">Interest: ${propertyType}</p>` : ""}
                </td>
              </tr>
              <tr>
                <td style="padding-top:20px;">
                  <p style="margin:0 0 10px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Message</p>
                  <p style="margin:0;color:#1f2937;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
                </td>
              </tr>
            </table>
            <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;">
              <a href="mailto:${fromEmail}" style="display:inline-block;background:#C9A84C;color:#0A1628;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;">
                Reply to ${fromName}
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">\xA9 2026 Luxe Property Solutions \xB7 St. Louis, MO</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  });
}

// server/adminRouter.ts
var adminProcedure2 = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return opts.next();
});
var adminRouter = router({
  // Dashboard
  getDashboardStats: adminProcedure2.query(async () => {
    return await getDashboardStats();
  }),
  // Properties
  getAllProperties: adminProcedure2.query(async () => {
    return await getAllProperties();
  }),
  getPropertyById: adminProcedure2.input(z2.string()).query(async ({ input }) => {
    return await getPropertyById(input);
  }),
  createProperty: adminProcedure2.input(
    z2.object({
      name: z2.string(),
      address: z2.string(),
      city: z2.string(),
      state: z2.string(),
      zipCode: z2.string(),
      price: z2.string(),
      type: z2.enum(["Rent", "Sale"]),
      beds: z2.number(),
      baths: z2.number(),
      sqft: z2.number(),
      description: z2.string().optional(),
      amenities: z2.string().optional(),
      images: z2.string().optional(),
      featured: z2.boolean().optional(),
      ownerId: z2.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const id = await createProperty({
      ...input,
      createdBy: ctx.user.id
    });
    return { id };
  }),
  updateProperty: adminProcedure2.input(
    z2.object({
      id: z2.string(),
      name: z2.string().optional(),
      address: z2.string().optional(),
      city: z2.string().optional(),
      state: z2.string().optional(),
      zipCode: z2.string().optional(),
      price: z2.string().optional(),
      type: z2.enum(["Rent", "Sale"]).optional(),
      beds: z2.number().optional(),
      baths: z2.number().optional(),
      sqft: z2.number().optional(),
      description: z2.string().optional(),
      amenities: z2.string().optional(),
      images: z2.string().optional(),
      featured: z2.boolean().optional(),
      active: z2.boolean().optional(),
      ownerId: z2.string().optional().nullable()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await updateProperty(id, data);
    return { success: true };
  }),
  deleteProperty: adminProcedure2.input(z2.string()).mutation(async ({ input }) => {
    await deleteProperty(input);
    return { success: true };
  }),
  // Inquiries
  getAllInquiries: adminProcedure2.query(async () => {
    return await getAllInquiries();
  }),
  getInquiryById: adminProcedure2.input(z2.string()).query(async ({ input }) => {
    return await getInquiryById(input);
  }),
  updateInquiry: adminProcedure2.input(
    z2.object({
      id: z2.string(),
      status: z2.enum(["new", "contacted", "qualified", "closed"]).optional(),
      notes: z2.string().optional(),
      assignedTo: z2.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await updateInquiry(id, data);
    return { success: true };
  }),
  // Maintenance Requests
  getAllMaintenanceRequests: adminProcedure2.query(async () => {
    return await getAllMaintenanceRequests();
  }),
  getMaintenanceRequestById: adminProcedure2.input(z2.string()).query(async ({ input }) => {
    return await getMaintenanceRequestById(input);
  }),
  updateMaintenanceRequest: adminProcedure2.input(
    z2.object({
      id: z2.string(),
      status: z2.enum(["open", "in_progress", "completed", "closed"]).optional(),
      priority: z2.enum(["low", "medium", "high", "urgent"]).optional(),
      assignedTo: z2.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await updateMaintenanceRequest(id, data);
    return { success: true };
  }),
  // Payments
  getAllPayments: adminProcedure2.query(async () => {
    return await getAllPayments();
  }),
  getPaymentById: adminProcedure2.input(z2.string()).query(async ({ input }) => {
    return await getPaymentById(input);
  }),
  // Tenants
  getAllTenants: adminProcedure2.query(async () => {
    return await getAllTenants();
  }),
  getTenantById: adminProcedure2.input(z2.string()).query(async ({ input }) => {
    return await getTenantById(input);
  }),
  // Users
  getAllUsers: adminProcedure2.query(async () => {
    return await getAllUsers();
  }),
  getUsersByRole: adminProcedure2.input(z2.enum(["admin", "owner", "tenant", "user"])).query(async ({ input }) => {
    return await getUsersByRole(input);
  }),
  // Users
  createUserAccount: adminProcedure2.input(z2.object({
    name: z2.string().min(1),
    email: z2.string().email(),
    role: z2.enum(["admin", "owner", "tenant", "user"])
  })).mutation(async ({ input }) => {
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
      mustChangePassword: true
    });
    if (input.role === "owner") {
      sendOwnerWelcomeEmail({ to: input.email, name: input.name, tempPassword }).catch((err) => console.error("[Email] Failed to send owner welcome email:", err));
    }
    return { id, tempPassword, success: true };
  }),
  // Owners (kept for backwards compat)
  createOwner: adminProcedure2.input(z2.object({ name: z2.string().min(1), email: z2.string().email() })).mutation(async ({ input }) => {
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
      mustChangePassword: true
    });
    sendOwnerWelcomeEmail({ to: input.email, name: input.name, tempPassword }).catch((err) => console.error("[Email] Failed to send owner welcome email:", err));
    return { id, success: true };
  }),
  // Units
  getUnitsForProperty: adminProcedure2.input(z2.string()).query(async ({ input }) => {
    return await getUnitsByProperty(input);
  }),
  createUnit: adminProcedure2.input(z2.object({
    propertyId: z2.string(),
    unitNumber: z2.string().min(1),
    rentAmount: z2.string().min(1),
    status: z2.enum(["vacant", "occupied", "maintenance"]).optional()
  })).mutation(async ({ input }) => {
    const id = await createUnit(input);
    return { id, success: true };
  }),
  updateUnit: adminProcedure2.input(z2.object({
    id: z2.string(),
    unitNumber: z2.string().optional(),
    rentAmount: z2.string().optional(),
    status: z2.enum(["vacant", "occupied", "maintenance"]).optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await updateUnit(id, data);
    return { success: true };
  }),
  deleteUnit: adminProcedure2.input(z2.string()).mutation(async ({ input }) => {
    await deleteUnit(input);
    return { success: true };
  }),
  testEmail: adminProcedure2.input(z2.object({ to: z2.string().email() })).mutation(async ({ input }) => {
    return await sendTestEmail(input.to);
  }),
  seedTestAccounts: adminProcedure2.mutation(async () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    const genPw = () => Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const results = {};
    const ownerEmail = "test.owner@luxestl.com";
    const existingOwner = await getUserByEmail(ownerEmail);
    if (!existingOwner) {
      const ownerPw = genPw();
      await createUser({
        email: ownerEmail,
        name: "Test Owner",
        passwordHash: await hashPassword(ownerPw),
        role: "owner",
        mustChangePassword: false
      });
      results.owner = { email: ownerEmail, password: ownerPw, created: true };
    } else {
      results.owner = { email: ownerEmail, password: "(already exists)", created: false };
    }
    const tenantEmail = "test.tenant@luxestl.com";
    const existingTenant = await getUserByEmail(tenantEmail);
    if (!existingTenant) {
      const tenantPw = genPw();
      const userId = await createUser({
        email: tenantEmail,
        name: "Test Tenant",
        passwordHash: await hashPassword(tenantPw),
        role: "tenant",
        mustChangePassword: false
      });
      const allUnits = await getAllUnits();
      const firstUnit = allUnits[0];
      if (firstUnit) {
        await createTenant({
          userId,
          unitId: firstUnit.id,
          leaseStartDate: /* @__PURE__ */ new Date(),
          leaseEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3)
        });
      }
      results.tenant = { email: tenantEmail, password: tenantPw, created: true };
    } else {
      results.tenant = { email: tenantEmail, password: "(already exists)", created: false };
    }
    return results;
  })
});

// server/ownerRouter.ts
import { z as z3 } from "zod";
var ownerProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "owner" && opts.ctx.user?.role !== "admin") {
    throw new Error("Unauthorized: Owner access required");
  }
  return opts.next();
});
var ownerRouter = router({
  // Dashboard
  getStats: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerStats(ctx.user.id);
  }),
  // Properties
  getProperties: ownerProcedure.query(async ({ ctx }) => {
    return await getOwnerProperties(ctx.user.id);
  }),
  getPropertyById: ownerProcedure.input(z3.string()).query(async ({ input }) => {
    return await getOwnerProperties(input);
  }),
  updateProperty: ownerProcedure.input(
    z3.object({
      id: z3.string(),
      name: z3.string().optional(),
      address: z3.string().optional(),
      city: z3.string().optional(),
      state: z3.string().optional(),
      zipCode: z3.string().optional(),
      price: z3.string().optional(),
      type: z3.enum(["Rent", "Sale"]).optional(),
      beds: z3.number().optional(),
      baths: z3.number().optional(),
      sqft: z3.number().optional(),
      description: z3.string().optional(),
      amenities: z3.string().optional(),
      images: z3.string().optional(),
      featured: z3.boolean().optional(),
      active: z3.boolean().optional()
    })
  ).mutation(async ({ input }) => {
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
  })
});

// server/tenantRouter.ts
import { z as z4 } from "zod";
var tenantProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "tenant" && opts.ctx.user?.role !== "admin") {
    throw new Error("Unauthorized: Tenant access required");
  }
  return opts.next();
});
var tenantRouter = router({
  // Dashboard
  getStats: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await getTenantByUserId(ctx.user.id);
    if (!tenant) {
      return {
        totalPayments: 0,
        totalInvoices: 0,
        totalMaintenanceRequests: 0
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
  createMaintenanceRequest: tenantProcedure.input(
    z4.object({
      title: z4.string(),
      description: z4.string(),
      priority: z4.enum(["low", "medium", "high", "urgent"]).default("medium")
    })
  ).mutation(async ({ input, ctx }) => {
    const tenant = await getTenantByUserId(ctx.user.id);
    if (!tenant) {
      throw new Error("Tenant profile not found");
    }
    const id = await createMaintenanceRequest({
      propertyId: tenant.unitId,
      // Using unitId as propertyId for now
      tenantId: tenant.id,
      unitId: tenant.unitId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: "open"
    });
    return { id };
  }),
  // Documents
  getDocuments: tenantProcedure.query(async ({ ctx }) => {
    const tenant = await getTenantByUserId(ctx.user.id);
    if (!tenant) return [];
    return await getTenantDocuments(tenant.id);
  })
});

// server/applicationRouter.ts
import Stripe from "stripe";
import { z as z5 } from "zod";
function getStripe() {
  if (!ENV.stripeSecretKey) return null;
  return new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-06-24.dahlia" });
}
var adminProcedure3 = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return opts.next();
});
var referenceSchema = z5.object({
  name: z5.string(),
  phone: z5.string(),
  relationship: z5.string()
});
var occupantSchema = z5.object({
  name: z5.string(),
  age: z5.string(),
  relationship: z5.string()
});
var applicationInputSchema = z5.object({
  // Property
  propertyId: z5.string().optional(),
  propertyAddress: z5.string().optional(),
  // Personal
  firstName: z5.string().min(1),
  lastName: z5.string().min(1),
  email: z5.string().email(),
  phone: z5.string().min(1),
  dateOfBirth: z5.string().min(1),
  ssn: z5.string().optional(),
  // Current address
  currentAddress: z5.string().min(1),
  currentCity: z5.string().min(1),
  currentState: z5.string().min(1),
  currentZip: z5.string().min(1),
  currentLengthOfResidence: z5.string().optional(),
  currentLandlordName: z5.string().optional(),
  currentLandlordPhone: z5.string().optional(),
  currentMonthlyRent: z5.string().optional(),
  reasonForLeaving: z5.string().optional(),
  // Employment
  employmentStatus: z5.enum(["employed", "self_employed", "unemployed", "retired", "student"]),
  employerName: z5.string().optional(),
  employerPhone: z5.string().optional(),
  employerAddress: z5.string().optional(),
  jobTitle: z5.string().optional(),
  monthsEmployed: z5.number().optional(),
  monthlyIncome: z5.string().optional(),
  additionalIncome: z5.string().optional(),
  additionalIncomeSource: z5.string().optional(),
  // References
  references: z5.array(referenceSchema).optional(),
  // Occupants
  additionalOccupants: z5.array(occupantSchema).optional(),
  // Pets
  hasPets: z5.boolean().default(false),
  petDetails: z5.string().optional(),
  // Background
  hasEviction: z5.boolean().default(false),
  evictionDetails: z5.string().optional(),
  hasCriminalHistory: z5.boolean().default(false),
  criminalDetails: z5.string().optional(),
  hasBankruptcy: z5.boolean().default(false),
  bankruptcyDetails: z5.string().optional(),
  // Voucher / Housing Assistance
  hasVoucher: z5.boolean().default(false),
  voucherType: z5.enum(["section8_hcv", "vash", "other"]).optional(),
  phaName: z5.string().optional(),
  phaPhone: z5.string().optional(),
  phaEmail: z5.string().optional(),
  voucherNumber: z5.string().optional(),
  voucherAmount: z5.string().optional(),
  voucherBedrooms: z5.string().optional(),
  voucherExpirationDate: z5.string().optional()
});
var applicationRouter = router({
  // Step 1: Save application data and create Stripe payment intent
  initiate: publicProcedure.input(applicationInputSchema).mutation(async ({ input }) => {
    const stripe = getStripe();
    let stripePaymentIntentId;
    let stripeClientSecret;
    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: ENV.applicationFeeAmount,
        currency: "usd",
        metadata: {
          applicantEmail: input.email,
          applicantName: `${input.firstName} ${input.lastName}`
        },
        description: "Rental Application Fee & Background Check"
      });
      stripePaymentIntentId = paymentIntent.id;
      stripeClientSecret = paymentIntent.client_secret ?? void 0;
    }
    const id = await createRentalApplication({
      ...input,
      references: input.references ?? [],
      additionalOccupants: input.additionalOccupants ?? [],
      applicationFee: (ENV.applicationFeeAmount / 100).toFixed(2),
      stripePaymentIntentId,
      stripeClientSecret,
      status: "incomplete",
      paymentStatus: "pending"
    });
    return {
      applicationId: id,
      clientSecret: stripeClientSecret ?? null,
      applicationFee: ENV.applicationFeeAmount / 100
    };
  }),
  // Step 2: Confirm payment success and mark application submitted
  confirmPayment: publicProcedure.input(z5.object({ applicationId: z5.string() })).mutation(async ({ input }) => {
    const app2 = await getRentalApplicationById(input.applicationId);
    if (!app2) throw new Error("Application not found");
    const stripe = getStripe();
    let paymentConfirmed = false;
    if (stripe && app2.stripePaymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(app2.stripePaymentIntentId);
      paymentConfirmed = pi.status === "succeeded";
    } else {
      paymentConfirmed = true;
    }
    if (!paymentConfirmed) {
      throw new Error("Payment has not been completed");
    }
    await updateRentalApplication(input.applicationId, {
      paymentStatus: "paid",
      status: "submitted"
    });
    await notifyOwner({
      title: "New Rental Application Received",
      content: `A new rental application was submitted by ${app2.firstName} ${app2.lastName} (${app2.email}).`
    });
    return { success: true };
  }),
  // Get application status (for confirmation page)
  getStatus: publicProcedure.input(z5.object({ applicationId: z5.string() })).query(async ({ input }) => {
    const app2 = await getRentalApplicationById(input.applicationId);
    if (!app2) throw new Error("Application not found");
    return {
      id: app2.id,
      status: app2.status,
      paymentStatus: app2.paymentStatus,
      firstName: app2.firstName,
      lastName: app2.lastName,
      email: app2.email,
      createdAt: app2.createdAt
    };
  }),
  // Admin: list all applications
  admin: router({
    getAll: adminProcedure3.query(async () => {
      return await getAllRentalApplications();
    }),
    getById: adminProcedure3.input(z5.string()).query(async ({ input }) => {
      return await getRentalApplicationById(input);
    }),
    updateStatus: adminProcedure3.input(z5.object({
      id: z5.string(),
      status: z5.enum(["under_review", "denied", "withdrawn"]),
      reviewNotes: z5.string().optional()
    })).mutation(async ({ input, ctx }) => {
      await updateRentalApplication(input.id, {
        status: input.status,
        reviewNotes: input.reviewNotes,
        reviewedBy: ctx.user.id,
        reviewedAt: /* @__PURE__ */ new Date()
      });
      return { success: true };
    }),
    approve: adminProcedure3.input(z5.object({
      applicationId: z5.string(),
      unitId: z5.string(),
      leaseStartDate: z5.string(),
      leaseEndDate: z5.string(),
      reviewNotes: z5.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const app2 = await getRentalApplicationById(input.applicationId);
      if (!app2) throw new Error("Application not found");
      const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
      const tempPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const passwordHash = await hashPassword(tempPassword);
      const existingUser = await getUserByEmail(app2.email);
      let userId;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        userId = await createUser({
          email: app2.email,
          name: `${app2.firstName} ${app2.lastName}`,
          passwordHash,
          role: "tenant",
          mustChangePassword: true
        });
      }
      await createTenant({
        userId,
        unitId: input.unitId,
        leaseStartDate: new Date(input.leaseStartDate),
        leaseEndDate: new Date(input.leaseEndDate)
      });
      await markUnitOccupied(input.unitId);
      await updateRentalApplication(input.applicationId, {
        status: "approved",
        reviewNotes: input.reviewNotes,
        reviewedBy: ctx.user.id,
        reviewedAt: /* @__PURE__ */ new Date()
      });
      const units2 = await getAllUnits();
      const unit = units2.find((u) => u.id === input.unitId);
      const unitAddress = unit ? `Unit ${unit.unitNumber} \u2014 ${unit.propertyAddress}` : "Your assigned unit";
      sendWelcomeEmail({
        to: app2.email,
        name: `${app2.firstName} ${app2.lastName}`,
        tempPassword,
        unitAddress
      }).catch((err) => console.error("[Email] Failed to send welcome email:", err));
      return { success: true };
    }),
    getAvailableUnits: adminProcedure3.query(async () => {
      return await getAllUnits();
    })
  })
});

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  owner: ownerRouter,
  tenant: tenantRouter,
  application: applicationRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  contact: router({
    submitForm: publicProcedure.input(
      z6.object({
        name: z6.string().min(1, "Name is required"),
        email: z6.string().email("Invalid email address"),
        phone: z6.string().optional(),
        propertyType: z6.string().optional(),
        message: z6.string().min(1, "Message is required")
      })
    ).mutation(async ({ input }) => {
      try {
        const inquiryId = await createInquiry({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          propertyType: input.propertyType || null,
          message: input.message,
          status: "new"
        });
        notifyOwner({
          title: "New Contact Form Submission",
          content: `New inquiry from ${input.name} (${input.email})

Message: ${input.message}`
        }).catch(() => {
        });
        sendContactNotificationEmail({
          fromName: input.name,
          fromEmail: input.email,
          phone: input.phone ?? void 0,
          propertyType: input.propertyType ?? void 0,
          message: input.message
        }).catch((err) => console.error("[Contact] Email notification failed:", err));
        return {
          success: true,
          inquiryId,
          message: "Thank you for your inquiry. We will contact you soon."
        };
      } catch (error) {
        console.error("[Contact Form] Failed to submit:", error);
        throw new Error("Failed to submit contact form");
      }
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server-entry.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({ router: appRouter, createContext })
);
var server_entry_default = app;
export {
  server_entry_default as default
};
