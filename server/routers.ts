import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import { ownerRouter } from "./ownerRouter";
import { tenantRouter } from "./tenantRouter";
import { applicationRouter } from "./applicationRouter";
import { createInquiry, getPublishedBlogPosts } from "./db";
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
