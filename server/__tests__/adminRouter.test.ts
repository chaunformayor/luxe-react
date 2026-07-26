import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { adminRouter } from "../adminRouter";
import * as db from "../db";

// Mock the database module
vi.mock("../db", () => ({
  getDashboardStats: vi.fn(),
  getAllProperties: vi.fn(),
  getPropertyById: vi.fn(),
  createProperty: vi.fn(),
  updateProperty: vi.fn(),
  deleteProperty: vi.fn(),
  getAllInquiries: vi.fn(),
  getInquiryById: vi.fn(),
  updateInquiry: vi.fn(),
  getAllMaintenanceRequests: vi.fn(),
  getMaintenanceRequestById: vi.fn(),
  updateMaintenanceRequest: vi.fn(),
  getAllPayments: vi.fn(),
  getPaymentById: vi.fn(),
  getAllTenants: vi.fn(),
  getTenantById: vi.fn(),
  getAllUsers: vi.fn(),
  getUsersByRole: vi.fn(),
}));

describe("Admin Router", () => {
  describe("Dashboard Statistics", () => {
    it("should return dashboard stats", async () => {
      const mockStats = {
        totalProperties: 10,
        totalTenants: 25,
        openMaintenanceRequests: 3,
        totalRevenue: 15000,
      };

      vi.mocked(db.getDashboardStats).mockResolvedValue(mockStats);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getDashboardStats();
      expect(result).toEqual(mockStats);
      expect(db.getDashboardStats).toHaveBeenCalled();
    });
  });

  describe("Properties Management", () => {
    it("should get all properties", async () => {
      const mockProperties = [
        {
          id: "prop_1",
          name: "Luxury Apartment",
          address: "123 Main St",
          city: "Saint Louis",
          state: "MO",
          zipCode: "63101",
          price: "2500",
          type: "Rent",
          beds: 2,
          baths: 2,
          sqft: 1200,
          active: true,
        },
      ];

      vi.mocked(db.getAllProperties).mockResolvedValue(mockProperties as any);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getAllProperties();
      expect(result).toEqual(mockProperties);
      expect(db.getAllProperties).toHaveBeenCalled();
    });

    it("should get property by id", async () => {
      const mockProperty = {
        id: "prop_1",
        name: "Luxury Apartment",
        address: "123 Main St",
        city: "Saint Louis",
        state: "MO",
        zipCode: "63101",
        price: "2500",
        type: "Rent",
        beds: 2,
        baths: 2,
        sqft: 1200,
        active: true,
      };

      vi.mocked(db.getPropertyById).mockResolvedValue(mockProperty as any);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getPropertyById("prop_1");
      expect(result).toEqual(mockProperty);
      expect(db.getPropertyById).toHaveBeenCalledWith("prop_1");
    });

    it("should create property", async () => {
      vi.mocked(db.createProperty).mockResolvedValue("prop_new");

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.createProperty({
        name: "New Property",
        address: "456 Oak Ave",
        city: "Saint Louis",
        state: "MO",
        zipCode: "63102",
        price: "3000",
        type: "Rent",
        beds: 3,
        baths: 2,
        sqft: 1500,
      });

      expect(result).toEqual({ id: "prop_new" });
      expect(db.createProperty).toHaveBeenCalled();
    });

    it("should update property", async () => {
      vi.mocked(db.updateProperty).mockResolvedValue(undefined);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.updateProperty({
        id: "prop_1",
        name: "Updated Property",
        active: false,
      });

      expect(result).toEqual({ success: true });
      expect(db.updateProperty).toHaveBeenCalledWith("prop_1", {
        name: "Updated Property",
        active: false,
      });
    });

    it("should delete property", async () => {
      vi.mocked(db.deleteProperty).mockResolvedValue(undefined);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.deleteProperty("prop_1");

      expect(result).toEqual({ success: true });
      expect(db.deleteProperty).toHaveBeenCalledWith("prop_1");
    });
  });

  describe("Inquiries Management", () => {
    it("should get all inquiries", async () => {
      const mockInquiries = [
        {
          id: "inq_1",
          name: "John Doe",
          email: "john@example.com",
          phone: "555-1234",
          message: "Interested in property",
          status: "new",
        },
      ];

      vi.mocked(db.getAllInquiries).mockResolvedValue(mockInquiries as any);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getAllInquiries();
      expect(result).toEqual(mockInquiries);
      expect(db.getAllInquiries).toHaveBeenCalled();
    });

    it("should update inquiry status", async () => {
      vi.mocked(db.updateInquiry).mockResolvedValue(undefined);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.updateInquiry({
        id: "inq_1",
        status: "contacted",
        notes: "Called customer",
      });

      expect(result).toEqual({ success: true });
      expect(db.updateInquiry).toHaveBeenCalled();
    });
  });

  describe("Maintenance Requests", () => {
    it("should get all maintenance requests", async () => {
      const mockRequests = [
        {
          id: "maint_1",
          propertyId: "prop_1",
          title: "Fix leaky faucet",
          status: "open",
          priority: "medium",
        },
      ];

      vi.mocked(db.getAllMaintenanceRequests).mockResolvedValue(mockRequests as any);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getAllMaintenanceRequests();
      expect(result).toEqual(mockRequests);
      expect(db.getAllMaintenanceRequests).toHaveBeenCalled();
    });

    it("should update maintenance request", async () => {
      vi.mocked(db.updateMaintenanceRequest).mockResolvedValue(undefined);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.updateMaintenanceRequest({
        id: "maint_1",
        status: "in_progress",
        priority: "high",
      });

      expect(result).toEqual({ success: true });
      expect(db.updateMaintenanceRequest).toHaveBeenCalled();
    });
  });

  describe("Users Management", () => {
    it("should get all users", async () => {
      const mockUsers = [
        {
          id: "user_1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        },
      ];

      vi.mocked(db.getAllUsers).mockResolvedValue(mockUsers as any);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getAllUsers();
      expect(result).toEqual(mockUsers);
      expect(db.getAllUsers).toHaveBeenCalled();
    });

    it("should get users by role", async () => {
      const mockOwners = [
        {
          id: "owner_1",
          name: "Property Owner",
          email: "owner@example.com",
          role: "owner",
        },
      ];

      vi.mocked(db.getUsersByRole).mockResolvedValue(mockOwners as any);

      const caller = adminRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getUsersByRole("owner");
      expect(result).toEqual(mockOwners);
      expect(db.getUsersByRole).toHaveBeenCalledWith("owner");
    });
  });

  describe("Authorization", () => {
    it("should reject non-admin users", async () => {
      const caller = adminRouter.createCaller({
        user: { id: "user_1", role: "tenant", name: "Tenant User" },
        req: {} as any,
        res: {} as any,
      } as any);

      try {
        await caller.getAllProperties();
        expect.fail("Should have thrown authorization error");
      } catch (error: any) {
        expect(error.message).toContain("Admin access required");
      }
    });
  });
});
