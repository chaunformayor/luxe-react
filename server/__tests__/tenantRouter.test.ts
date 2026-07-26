import { describe, it, expect, vi } from "vitest";
import { tenantRouter } from "../tenantRouter";
import * as db from "../db";

// Mock the database module
vi.mock("../db", () => ({
  getTenantByUserId: vi.fn(),
  getTenantPayments: vi.fn(),
  getTenantInvoices: vi.fn(),
  getTenantMaintenanceRequests: vi.fn(),
  createMaintenanceRequest: vi.fn(),
  getTenantDocuments: vi.fn(),
  getTenantStats: vi.fn(),
}));

describe("Tenant Router", () => {
  describe("Dashboard Statistics", () => {
    it("should return tenant stats", async () => {
      const mockStats = {
        totalPayments: 12,
        totalInvoices: 12,
        totalMaintenanceRequests: 2,
      };

      vi.mocked(db.getTenantByUserId).mockResolvedValue({
        id: "tenant_1",
        userId: "user_1",
        unitId: "unit_1",
        status: "active",
      } as any);

      vi.mocked(db.getTenantStats).mockResolvedValue(mockStats);

      const caller = tenantRouter.createCaller({
        user: { id: "user_1", role: "tenant", name: "Tenant User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getStats();
      expect(result).toEqual(mockStats);
    });
  });

  describe("Tenant Information", () => {
    it("should get tenant info", async () => {
      const mockTenant = {
        id: "tenant_1",
        userId: "user_1",
        unitId: "unit_1",
        leaseStartDate: new Date(),
        leaseEndDate: new Date(),
        status: "active",
      };

      vi.mocked(db.getTenantByUserId).mockResolvedValue(mockTenant as any);

      const caller = tenantRouter.createCaller({
        user: { id: "user_1", role: "tenant", name: "Tenant User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getTenantInfo();
      expect(result).toEqual(mockTenant);
      expect(db.getTenantByUserId).toHaveBeenCalledWith("user_1");
    });
  });

  describe("Payment Management", () => {
    it("should get tenant payments", async () => {
      const mockPayments = [
        {
          id: "pay_1",
          amount: "2500",
          status: "completed",
          paymentMethod: "stripe",
        },
      ];

      vi.mocked(db.getTenantByUserId).mockResolvedValue({
        id: "tenant_1",
        userId: "user_1",
      } as any);

      vi.mocked(db.getTenantPayments).mockResolvedValue(mockPayments as any);

      const caller = tenantRouter.createCaller({
        user: { id: "user_1", role: "tenant", name: "Tenant User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getPayments();
      expect(result).toEqual(mockPayments);
      expect(db.getTenantPayments).toHaveBeenCalledWith("tenant_1");
    });
  });

  describe("Invoice Management", () => {
    it("should get tenant invoices", async () => {
      const mockInvoices = [
        {
          id: "inv_1",
          amount: "2500",
          status: "paid",
          dueDate: new Date(),
        },
      ];

      vi.mocked(db.getTenantByUserId).mockResolvedValue({
        id: "tenant_1",
        userId: "user_1",
      } as any);

      vi.mocked(db.getTenantInvoices).mockResolvedValue(mockInvoices as any);

      const caller = tenantRouter.createCaller({
        user: { id: "user_1", role: "tenant", name: "Tenant User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getInvoices();
      expect(result).toEqual(mockInvoices);
      expect(db.getTenantInvoices).toHaveBeenCalledWith("tenant_1");
    });
  });

  describe("Maintenance Request Management", () => {
    it("should get tenant maintenance requests", async () => {
      const mockRequests = [
        {
          id: "maint_1",
          title: "Fix leaky faucet",
          status: "open",
          priority: "medium",
        },
      ];

      vi.mocked(db.getTenantByUserId).mockResolvedValue({
        id: "tenant_1",
        userId: "user_1",
      } as any);

      vi.mocked(db.getTenantMaintenanceRequests).mockResolvedValue(mockRequests as any);

      const caller = tenantRouter.createCaller({
        user: { id: "user_1", role: "tenant", name: "Tenant User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getMaintenanceRequests();
      expect(result).toEqual(mockRequests);
      expect(db.getTenantMaintenanceRequests).toHaveBeenCalledWith("tenant_1");
    });

    it("should create maintenance request", async () => {
      const mockTenant = {
        id: "tenant_1",
        userId: "user_1",
        unitId: "unit_1",
      };

      vi.mocked(db.getTenantByUserId).mockResolvedValue(mockTenant as any);
      vi.mocked(db.createMaintenanceRequest).mockResolvedValue("maint_123");

      const caller = tenantRouter.createCaller({
        user: { id: "user_1", role: "tenant", name: "Tenant User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.createMaintenanceRequest({
        title: "Fix leaky faucet",
        description: "Kitchen faucet is leaking",
        priority: "high",
      });

      expect(result).toEqual({ id: "maint_123" });
      expect(db.createMaintenanceRequest).toHaveBeenCalled();
    });

    it("should reject maintenance request if tenant not found", async () => {
      vi.mocked(db.getTenantByUserId).mockResolvedValue(null);

      const caller = tenantRouter.createCaller({
        user: { id: "user_1", role: "tenant", name: "Tenant User" },
        req: {} as any,
        res: {} as any,
      } as any);

      try {
        await caller.createMaintenanceRequest({
          title: "Fix leaky faucet",
          description: "Kitchen faucet is leaking",
          priority: "high",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Tenant profile not found");
      }
    });
  });

  describe("Document Management", () => {
    it("should get tenant documents", async () => {
      const mockDocuments = [
        {
          id: "doc_1",
          name: "Lease Agreement",
          type: "lease",
          url: "https://example.com/lease.pdf",
        },
      ];

      vi.mocked(db.getTenantByUserId).mockResolvedValue({
        id: "tenant_1",
        userId: "user_1",
      } as any);

      vi.mocked(db.getTenantDocuments).mockResolvedValue(mockDocuments as any);

      const caller = tenantRouter.createCaller({
        user: { id: "user_1", role: "tenant", name: "Tenant User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getDocuments();
      expect(result).toEqual(mockDocuments);
      expect(db.getTenantDocuments).toHaveBeenCalledWith("tenant_1");
    });
  });

  describe("Authorization", () => {
    it("should reject non-tenant users", async () => {
      const caller = tenantRouter.createCaller({
        user: { id: "user_1", role: "owner", name: "Owner User" },
        req: {} as any,
        res: {} as any,
      } as any);

      try {
        await caller.getPayments();
        expect.fail("Should have thrown authorization error");
      } catch (error: any) {
        expect(error.message).toContain("Tenant access required");
      }
    });

    it("should allow admin users", async () => {
      vi.mocked(db.getTenantByUserId).mockResolvedValue({
        id: "tenant_1",
        userId: "user_1",
      } as any);

      vi.mocked(db.getTenantPayments).mockResolvedValue([]);

      const caller = tenantRouter.createCaller({
        user: { id: "admin1", role: "admin", name: "Admin User" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getPayments();
      expect(result).toEqual([]);
    });
  });
});
