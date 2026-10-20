import Stripe from "stripe";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import {
  createRentalApplication,
  getRentalApplicationById,
  updateRentalApplication,
  getAllRentalApplications,
  getUserByEmail,
  createUser,
  createTenant,
  markUnitOccupied,
  getAllUnits,
} from "./db";
import { hashPassword } from "./authRoutes";
import { deliver, sendWelcomeEmail } from "./email";
import { notifyOwner } from "./_core/notification";

function getStripe() {
  if (!ENV.stripeSecretKey) return null;
  return new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-06-24.dahlia" });
}

const adminProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return opts.next();
});

const referenceSchema = z.object({
  name: z.string(),
  phone: z.string(),
  relationship: z.string(),
});

const occupantSchema = z.object({
  name: z.string(),
  age: z.string(),
  relationship: z.string(),
});

const applicationInputSchema = z.object({
  // Property
  propertyId: z.string().optional(),
  propertyAddress: z.string().optional(),

  // Personal
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  dateOfBirth: z.string().min(1),
  ssn: z.string().optional(),

  // Current address
  currentAddress: z.string().min(1),
  currentCity: z.string().min(1),
  currentState: z.string().min(1),
  currentZip: z.string().min(1),
  currentLengthOfResidence: z.string().optional(),
  currentLandlordName: z.string().optional(),
  currentLandlordPhone: z.string().optional(),
  currentMonthlyRent: z.string().optional(),
  reasonForLeaving: z.string().optional(),

  // Employment
  employmentStatus: z.enum(["employed", "self_employed", "unemployed", "retired", "student"]),
  employerName: z.string().optional(),
  employerPhone: z.string().optional(),
  employerAddress: z.string().optional(),
  jobTitle: z.string().optional(),
  monthsEmployed: z.number().optional(),
  monthlyIncome: z.string().optional(),
  additionalIncome: z.string().optional(),
  additionalIncomeSource: z.string().optional(),

  // References
  references: z.array(referenceSchema).optional(),

  // Occupants
  additionalOccupants: z.array(occupantSchema).optional(),

  // Preferences
  desiredMoveInDate: z.string().optional(),
  leaseTermPreference: z.string().optional(),

  // Co-applicant
  coApplicantInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    dateOfBirth: z.string(),
  }).optional(),

  // Documents (base64)
  idDocumentBase64: z.string().optional(),
  incomeDocumentBase64: z.string().optional(),

  // Pets
  hasPets: z.boolean().default(false),
  petDetails: z.string().optional(),

  // Background
  hasEviction: z.boolean().default(false),
  evictionDetails: z.string().optional(),
  hasCriminalHistory: z.boolean().default(false),
  criminalDetails: z.string().optional(),
  hasBankruptcy: z.boolean().default(false),
  bankruptcyDetails: z.string().optional(),

  // Voucher / Housing Assistance
  hasVoucher: z.boolean().default(false),
  voucherType: z.enum(["section8_hcv", "vash", "other"]).optional(),
  phaName: z.string().optional(),
  phaPhone: z.string().optional(),
  phaEmail: z.string().optional(),
  voucherNumber: z.string().optional(),
  voucherAmount: z.string().optional(),
  voucherBedrooms: z.string().optional(),
  voucherExpirationDate: z.string().optional(),
});

export const applicationRouter = router({
  // Submit application — no payment collected here; admin sends payment link separately
  initiate: publicProcedure
    .input(applicationInputSchema)
    .mutation(async ({ input }) => {
      const id = await createRentalApplication({
        ...input,
        references: input.references ?? [],
        additionalOccupants: input.additionalOccupants ?? [],
        applicationFee: (ENV.applicationFeeAmount / 100).toFixed(2),
        status: "submitted",
        paymentStatus: "pending",
      });

      await notifyOwner({
        title: "New Rental Application Received",
        content: `${input.firstName} ${input.lastName} (${input.email}) submitted a rental application.`,
      });

      return { applicationId: id };
    }),

  // Called from /pay/:id — creates (or retrieves) a Stripe PaymentIntent for this application
  getForPayment: publicProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ input }) => {
      const app = await getRentalApplicationById(input.applicationId);
      if (!app) throw new Error("Application not found");
      if (app.paymentStatus === "paid") throw new Error("This application has already been paid.");

      const stripe = getStripe();
      let clientSecret: string | null = null;

      if (stripe) {
        if (app.stripeClientSecret && app.stripePaymentIntentId) {
          // Reuse existing PaymentIntent
          clientSecret = app.stripeClientSecret;
        } else {
          const pi = await stripe.paymentIntents.create({
            amount: ENV.applicationFeeAmount,
            currency: "usd",
            metadata: { applicantEmail: app.email, applicantName: `${app.firstName} ${app.lastName}` },
            description: "Rental Application Fee & Background Check",
          });
          await updateRentalApplication(input.applicationId, {
            stripePaymentIntentId: pi.id,
            stripeClientSecret: pi.client_secret ?? undefined,
          });
          clientSecret = pi.client_secret ?? null;
        }
      }

      return {
        applicationId: app.id,
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        applicationFee: ENV.applicationFeeAmount / 100,
        clientSecret,
        paymentStatus: app.paymentStatus,
      };
    }),

  // Confirm payment success and mark application paid
  confirmPayment: publicProcedure
    .input(z.object({ applicationId: z.string() }))
    .mutation(async ({ input }) => {
      const app = await getRentalApplicationById(input.applicationId);
      if (!app) throw new Error("Application not found");

      const stripe = getStripe();
      let paymentConfirmed = false;

      if (stripe && app.stripePaymentIntentId) {
        const pi = await stripe.paymentIntents.retrieve(app.stripePaymentIntentId);
        paymentConfirmed = pi.status === "succeeded";
      } else {
        // No Stripe configured — treat as confirmed for dev/demo
        paymentConfirmed = true;
      }

      if (!paymentConfirmed) {
        throw new Error("Payment has not been completed");
      }

      await updateRentalApplication(input.applicationId, {
        paymentStatus: "paid",
      });

      await notifyOwner({
        title: "Application Fee Received",
        content: `Payment confirmed for ${app.firstName} ${app.lastName} (${app.email}).`,
      });

      return { success: true };
    }),

  // Get application status (for confirmation page)
  getStatus: publicProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ input }) => {
      const app = await getRentalApplicationById(input.applicationId);
      if (!app) throw new Error("Application not found");
      return {
        id: app.id,
        status: app.status,
        paymentStatus: app.paymentStatus,
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        createdAt: app.createdAt,
      };
    }),

  // Admin: list all applications
  admin: router({
    getAll: adminProcedure.query(async () => {
      return await getAllRentalApplications();
    }),

    getById: adminProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return await getRentalApplicationById(input);
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum(["under_review", "denied", "withdrawn"]),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateRentalApplication(input.id, {
          status: input.status,
          reviewNotes: input.reviewNotes,
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
        });
        return { success: true };
      }),

    approve: adminProcedure
      .input(z.object({
        applicationId: z.string(),
        unitId: z.string(),
        leaseStartDate: z.string(),
        leaseEndDate: z.string(),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const app = await getRentalApplicationById(input.applicationId);
        if (!app) throw new Error("Application not found");

        // Generate a random temp password
        const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
        const tempPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        const passwordHash = await hashPassword(tempPassword);

        // Create tenant user account (or use existing)
        const existingUser = await getUserByEmail(app.email);
        let userId: string;

        if (existingUser) {
          userId = existingUser.id;
        } else {
          userId = await createUser({
            email: app.email,
            name: `${app.firstName} ${app.lastName}`,
            passwordHash,
            role: "tenant",
            mustChangePassword: true,
          });
        }

        // Create tenant record
        await createTenant({
          userId,
          unitId: input.unitId,
          leaseStartDate: new Date(input.leaseStartDate),
          leaseEndDate: new Date(input.leaseEndDate),
        });

        // Mark unit occupied
        await markUnitOccupied(input.unitId);

        // Update application status
        await updateRentalApplication(input.applicationId, {
          status: "approved",
          reviewNotes: input.reviewNotes,
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
        });

        // Get unit info for the email
        const units = await getAllUnits();
        const unit = units.find(u => u.id === input.unitId);
        const unitAddress = unit
          ? `Unit ${unit.unitNumber} — ${unit.propertyAddress}`
          : "Your assigned unit";

        // Welcome email: a failure doesn't undo the approval, but the admin is told.
        const delivery = await deliver("Tenant welcome email", () =>
          sendWelcomeEmail({
            to: app.email,
            name: `${app.firstName} ${app.lastName}`,
            tempPassword,
            unitAddress,
          })
        );

        return { success: true, ...delivery };
      }),

    getAvailableUnits: adminProcedure.query(async () => {
      return await getAllUnits();
    }),
  }),
});
