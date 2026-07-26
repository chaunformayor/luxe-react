import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { ownerRouter } from "../ownerRouter";
import * as db from "../db";

// Mock the database module
vi.mock("../db", () => ({
  getOwnerProperties: vi.fn(),
  getOwnerTenants: vi.fn(),
  getOwnerPayments: vi.fn(),
  getOwnerInvoices: vi.fn(),
  getOwnerMaintenanceRequests: vi.fn(),
  getOwnerDocuments: vi.fn(),
  getOwnerStats: vi.fn(),
  updateProperty: vi.fn(),
}));

describe("Owner Router", () => {
  describe("Dashboard Statistics", () => {
    it("should return owner stats", async () => {
      const mockStats = {
        totalProperties: 5,
        totalTenants: 12,
        totalRevenue: 8000,
        pendingMaintenance: 2,
      };

      vi.mocked(db.getOwnerStats).mockResolvedValue(mockStats);

      const caller = ownerRouter.createCaller({
        user: { id: "owner1", role: "owner", name: "Property Owner" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getStats();
      expect(result).toEqual(mockStats);
      expect(db.getOwnerStats).toHaveBeenCalledWith("owner1");
    });
  });

  describe("Properties Management", () => {
    it("should get owner properties", async () => {
      const mockProperties = [
        {
          id: "prop_1",
          name: "Apartment 1",
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
          ownerId: "owner1",
        },
      ];

      vi.mocked(db.getOwnerProperties).mockResolvedValue(mockProperties as any);

      const caller = ownerRouter.createCaller({
        user: { id: "owner1", role: "owner", name: "Property Owner" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getProperties();
      expect(result).toEqual(mockProperties);
      expect(db.getOwnerProperties).toHaveBeenCalledWith("owner1");
    });

    it("should update property", async () => {
      vi.mocked(db.updateProperty).mockResolvedValue(undefined);

      const caller = ownerRouter.createCaller({
        user: { id: "owner1", role: "owner", name: "Property Owner" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.updateProperty({
        id: "prop_1",
        name: "Updated Apartment",
        active: false,
      });

      expect(result).toEqual({ success: true });
      expect(db.updateProperty).toHaveBeenCalled();
    });
  });

  describe("Tenant Management", () => {
    it("should get owner tenants", async () => {
      const mockTenants = [
        {
          id: "tenant_1",
          userId: "user_1",
          unitId: "unit_1",
          leaseStartDate: new Date(),
          leaseEndDate: new Date(),
          status: "active",
        },
      ];

      vi.mocked(db.getOwnerTenants).mockResolvedValue(mockTenants as any);

      const caller = ownerRouter.createCaller({
        user: { id: "owner1", role: "owner", name: "Property Owner" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getTenants();
      expect(result).toEqual(mockTenants);
      expect(db.getOwnerTenants).toHaveBeenCalledWith("owner1");
    });
  });

  describe("Financial Management", () => {
    it("should get owner payments", async () => {
      const mockPayments = [
        {
          id: "pay_1",
          userId: "user_1",
          amount: "2500",
          status: "completed",
          paymentMethod: "stripe",
        },
      ];

      vi.mocked(db.getOwnerPayments).mockResolvedValue(mockPayments as any);

      const caller = ownerRouter.createCaller({
        user: { id: "owner1", role: "owner", name: "Property Owner" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getPayments();
      expect(result).toEqual(mockPayments);
      expect(db.getOwnerPayments).toHaveBeenCalledWith("owner1");
    });

    it("should get owner invoices", async () => {
      const mockInvoices = [
        {
          id: "inv_1",
          tenantId: "tenant_1",
          amount: "2500",
          status: "paid",
          dueDate: new Date(),
        },
      ];

      vi.mocked(db.getOwnerInvoices).mockResolvedValue(mockInvoices as any);

      const caller = ownerRouter.createCaller({
        user: { id: "owner1", role: "owner", name: "Property Owner" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getInvoices();
      expect(result).toEqual(mockInvoices);
      expect(db.getOwnerInvoices).toHaveBeenCalledWith("owner1");
    });
  });

  describe("Maintenance Management", () => {
    it("should get owner maintenance requests", async () => {
      const mockRequests = [
        {
          id: "maint_1",
          propertyId: "prop_1",
          title: "Fix leaky faucet",
          status: "open",
          priority: "medium",
        },
      ];

      vi.mocked(db.getOwnerMaintenanceRequests).mockResolvedValue(mockRequests as any);

      const caller = ownerRouter.createCaller({
        user: { id: "owner1", role: "owner", name: "Property Owner" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getMaintenanceRequests();
      expect(result).toEqual(mockRequests);
      expect(db.getOwnerMaintenanceRequests).toHaveBeenCalledWith("owner1");
    });
  });

  describe("Document Management", () => {
    it("should get owner documents", async () => {
      const mockDocuments = [
        {
          id: "doc_1",
          name: "Lease Agreement",
          type: "lease",
          url: "https://example.com/lease.pdf",
        },
      ];

      vi.mocked(db.getOwnerDocuments).mockResolvedValue(mockDocuments as any);

      const caller = ownerRouter.createCaller({
        user: { id: "owner1", role: "owner", name: "Property Owner" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getDocuments();
      expect(result).toEqual(mockDocuments);
      expect(db.getOwnerDocuments).toHaveBeenCalledWith("owner1");
    });
  });

  describe("Authorization", () => {
    it("should reject non-owner users", async () => {
      const caller = ownerRouter.createCaller({
        user: { id: "user_1", role: "tenant", name: "Tenant User" },
        req: {} as any,
        res: {} as any,
      } as any);

      try {
        await caller.getProperties();
        expect.fail("Should have thrown authorization error");
      } catch (error: any) {
        expect(error.message).toContain("Owner access required");
      }
    });

    it("should allow admin users", async () => {
      const mockProperties = [];

      vi.mocked(db.getOwnerProperties).mockResolvedValue(mockProperties as any);

      const caller = ownerRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getProperties();
      expect(result).toEqual(mockProperties);
    });
  });
});
