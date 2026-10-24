import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import { ownerRouter } from "./ownerRouter";
import { tenantRouter } from "./tenantRouter";
import { applicationRouter } from "./applicationRouter";
import { documentsRouter } from "./documentsRouter";
import { esignRouter, signRouter } from "./esign/router";
import { createInquiry, getPublishedBlogPosts, getPublishedBlogPostBySlug, subscribeToNewsletter, getAllProperties, getAllUnits } from "./db";
import { isMultifamily } from "@shared/propertyKinds";
import { notifyOwner } from "./_core/notification";
import { deliver, sendContactNotificationEmail } from "./email";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  owner: ownerRouter,
  tenant: tenantRouter,
  application: applicationRouter,
  documents: documentsRouter,
  esign: esignRouter,
  sign: signRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  properties: router({
    getAll: publicProcedure.query(async () => {
      const all = await getAllProperties();
      // Multifamily listings show their unit count and lowest rent rather than the building's total rent
      const unitsByProperty = new Map<string, { rent: number; vacant: boolean }[]>();
      for (const u of await getAllUnits()) {
        const list = unitsByProperty.get(u.propertyId) ?? [];
        list.push({ rent: Number(u.rentAmount), vacant: u.status === "vacant" });
        unitsByProperty.set(u.propertyId, list);
      }
      return all
        .filter((p: any) => p.active !== false)
        .map((p: any) => {
          const units = isMultifamily(p.propertyType) ? unitsByProperty.get(p.id) ?? [] : [];
          const rents = units.map((u) => u.rent).filter((r) => r > 0);
          return {
            ...p,
            unitCount: units.length,
            vacantUnits: units.filter((u) => u.vacant).length,
            minUnitRent: rents.length ? Math.min(...rents) : null,
          };
        });
    }),
  }),

  blog: router({
    getPosts: publicProcedure.query(async () => {
      return await getPublishedBlogPosts();
    }),
    getPost: publicProcedure.input(z.string()).query(async ({ input }) => {
      return await getPublishedBlogPostBySlug(input);
    }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email("Please enter a valid email address"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Save to DB (best-effort backup)
        try {
          await subscribeToNewsletter(input.email);
        } catch {
          // ignore duplicate errors
        }

        // Send to Kit via v3 API
        const kitApiKey = process.env.KIT_API_KEY;
        if (kitApiKey) {
          const res = await fetch("https://api.convertkit.com/v3/forms/9821464/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: kitApiKey,
              email: input.email,
              first_name: input.firstName,
              fields: { last_name: input.lastName ?? "" },
            }),
          });
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            console.error("[Newsletter] Kit API error:", res.status, body);
          } else {
            console.log("[Newsletter] Kit subscriber created:", input.email);
          }
        } else {
          console.warn("[Newsletter] KIT_API_KEY not set — subscriber saved to DB only");
        }

        return { success: true };
      }),
  }),

  contact: router({
    submitForm: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Invalid email address"),
          phone: z.string().optional(),
          propertyType: z.string().optional(),
          message: z.string().min(1, "Message is required"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Save inquiry to database
          const inquiryId = await createInquiry({
            name: input.name,
            email: input.email,
            phone: input.phone || null,
            propertyType: input.propertyType || null,
            message: input.message,
            status: "new",
          });

          // Send notification to owner (Manus service — no-op if not configured)
          notifyOwner({
            title: "New Contact Form Submission",
            content: `New inquiry from ${input.name} (${input.email})\n\nMessage: ${input.message}`,
          }).catch(() => {});

          // Email notification via Maileroo (the inquiry is already saved if this fails)
          await deliver("Contact notification email", () =>
            sendContactNotificationEmail({
              fromName: input.name,
              fromEmail: input.email,
              phone: input.phone ?? undefined,
              propertyType: input.propertyType ?? undefined,
              message: input.message,
            })
          );

          return {
            success: true,
            inquiryId,
            message: "Thank you for your inquiry. We will contact you soon.",
          };
        } catch (error) {
          console.error("[Contact Form] Failed to submit:", error);
          throw new Error("Failed to submit contact form");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
