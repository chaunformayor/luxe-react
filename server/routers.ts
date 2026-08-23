import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import { ownerRouter } from "./ownerRouter";
import { tenantRouter } from "./tenantRouter";
import { applicationRouter } from "./applicationRouter";
import { createInquiry, getPublishedBlogPosts, getPublishedBlogPostBySlug, subscribeToNewsletter } from "./db";
import { notifyOwner } from "./_core/notification";
import { sendContactNotificationEmail } from "./email";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  owner: ownerRouter,
  tenant: tenantRouter,
  application: applicationRouter,

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

        // Send to Kit
        const kitApiSecret = process.env.KIT_API_SECRET;
        if (kitApiSecret) {
          const res = await fetch("https://api.kit.com/v4/subscribers", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${kitApiSecret}`,
            },
            body: JSON.stringify({
              email_address: input.email,
              first_name: input.firstName,
              fields: { last_name: input.lastName ?? "" },
              state: "active",
            }),
          });
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            console.error("[Newsletter] Kit API error:", res.status, body);
          }
        } else {
          console.warn("[Newsletter] KIT_API_SECRET not set — subscriber saved to DB only");
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

          // Email notification via Maileroo
          sendContactNotificationEmail({
            fromName: input.name,
            fromEmail: input.email,
            phone: input.phone ?? undefined,
            propertyType: input.propertyType ?? undefined,
            message: input.message,
          }).catch(err => console.error("[Contact] Email notification failed:", err));

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
