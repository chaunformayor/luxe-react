import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "owner", "tenant"]).default("user").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Properties table
export const properties = mysqlTable("properties", {
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
  amenities: text("amenities"), // JSON array stored as text
  images: text("images"), // JSON array of image URLs
  featured: boolean("featured").default(false),
  active: boolean("active").default(true),
  ownerId: varchar("ownerId", { length: 64 }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 64 }).references(() => users.id),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

// Units/Apartments table
export const units = mysqlTable("units", {
  id: varchar("id", { length: 64 }).primaryKey(),
  propertyId: varchar("propertyId", { length: 64 }).notNull().references(() => properties.id),
  unitNumber: varchar("unitNumber", { length: 50 }).notNull(),
  rentAmount: decimal("rentAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["vacant", "occupied", "maintenance"]).default("vacant"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

// Tenants table
export const tenants = mysqlTable("tenants", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).references(() => users.id),
  unitId: varchar("unitId", { length: 64 }).references(() => units.id),
  leaseStartDate: timestamp("leaseStartDate"),
  leaseEndDate: timestamp("leaseEndDate"),
  status: mysqlEnum("status", ["active", "inactive", "evicted"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// Inquiries table
export const inquiries = mysqlTable("inquiries", {
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
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

// Maintenance Requests table
export const maintenanceRequests = mysqlTable("maintenanceRequests", {
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
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = typeof maintenanceRequests.$inferInsert;

// Payments table
export const payments = mysqlTable("payments", {
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
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Invoices table
export const invoices = mysqlTable("invoices", {
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
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// Subscriptions table (for recurring rent payments)
export const subscriptions = mysqlTable("subscriptions", {
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
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Documents table
export const documents = mysqlTable("documents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["lease", "inspection", "maintenance", "invoice", "other"]).notNull(),
  url: text("url").notNull(),
  propertyId: varchar("propertyId", { length: 64 }).references(() => properties.id),
  unitId: varchar("unitId", { length: 64 }).references(() => units.id),
  tenantId: varchar("tenantId", { length: 64 }).references(() => tenants.id),
  uploadedBy: varchar("uploadedBy", { length: 64 }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// Rental Applications table
export const rentalApplications = mysqlTable("rentalApplications", {
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
  ssn: varchar("ssn", { length: 20 }), // last 4 digits only for display

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
  references: json("references"), // [{name, phone, relationship}]

  // Additional occupants (JSON)
  additionalOccupants: json("additionalOccupants"), // [{name, age, relationship}]

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
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type RentalApplication = typeof rentalApplications.$inferSelect;
export type InsertRentalApplication = typeof rentalApplications.$inferInsert;

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  read: boolean("read").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
