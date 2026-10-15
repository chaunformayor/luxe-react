import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Request } from "express";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { TEMPLATE_CATEGORIES } from "../../drizzle/schema";
import * as esign from "./service";

const fileId = z.string().regex(/^\d+$/);
const token = z.string().min(40).max(64);

function auditFrom(req: Request): esign.Audit {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() || req.socket?.remoteAddress || null;
  const userAgent = req.headers["user-agent"] ?? null;
  return { ip, userAgent };
}

const signerInput = z.object({
  name: z.string().trim().min(1, "Each signer needs a name").max(255),
  email: z.string().trim().email("Each signer needs a valid email").max(320),
  roleLabel: z.string().trim().max(100).optional(),
});

export const esignRouter = router({
  templates: adminProcedure
    .input(z.object({ includeArchived: z.boolean().default(false) }).optional())
    .query(({ input }) => esign.listTemplates(input?.includeArchived ?? false)),

  createTemplate: adminProcedure
    .input(
      z.object({
        fileId,
        path: z.string(),
        name: z.string().trim().min(1).max(255),
        category: z.enum(TEMPLATE_CATEGORIES),
        signerRoles: z.array(z.string().max(100)).max(10),
        description: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => ({ id: await esign.createTemplate(input, ctx.user.id) })),

  updateTemplate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(255).optional(),
        category: z.enum(TEMPLATE_CATEGORIES).optional(),
        signerRoles: z.array(z.string().max(100)).max(10).optional(),
        description: z.string().max(1000).nullable().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input: { id, ...data } }) => {
      await esign.updateTemplate(id, data);
      return { success: true };
    }),

  requests: adminProcedure.query(() => esign.listRequests()),

  events: adminProcedure.input(z.object({ requestId: z.string() })).query(({ input }) => esign.requestEvents(input.requestId)),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().trim().min(1, "Give the document a title").max(255),
        category: z.enum(["lease", "management_agreement", "lien_waiver", "other"]),
        source: z.discriminatedUnion("kind", [
          z.object({ kind: z.literal("template"), templateId: z.string() }),
          z.object({ kind: z.literal("file"), fileId }),
          z.object({ kind: z.literal("upload"), fileId, path: z.string() }),
        ]),
        signers: z.array(signerInput).min(1, "Add at least one signer").max(10),
        sequential: z.boolean(),
        message: z.string().max(2000).optional(),
        tenantId: z.string().optional(),
        ownerUserId: z.string().optional(),
        propertyId: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => esign.createSignatureRequest(input, { id: ctx.user.id, name: ctx.user.name, email: ctx.user.email })),

  remind: adminProcedure
    .input(z.object({ requestId: z.string(), signerId: z.string().optional() }))
    .mutation(({ input }) => esign.remind(input.requestId, input.signerId)),

  signingLink: adminProcedure
    .input(z.object({ signerId: z.string() }))
    .mutation(async ({ input }) => ({ url: await esign.signingLinkFor(input.signerId) })),

  void: adminProcedure
    .input(z.object({ requestId: z.string(), reason: z.string().max(1000).optional() }))
    .mutation(async ({ input }) => {
      await esign.voidRequest(input.requestId, input.reason);
      return { success: true };
    }),

  retry: adminProcedure.input(z.object({ requestId: z.string() })).mutation(async ({ input }) => {
    const request = await esign.getRequest(input.requestId);
    if (request.status !== "error") throw new TRPCError({ code: "BAD_REQUEST", message: "Only failed requests can be retried." });
    await esign.finalizeRequest(input.requestId);
    return { status: (await esign.getRequest(input.requestId)).status };
  }),
});

// Public, token-based endpoints used by /sign/:token
export const signRouter = router({
  get: publicProcedure.input(z.object({ token })).query(({ input }) => esign.publicSession(input.token)),

  view: publicProcedure.input(z.object({ token })).mutation(async ({ input, ctx }) => {
    await esign.markViewed(input.token, auditFrom(ctx.req));
    return { success: true };
  }),

  submit: publicProcedure
    .input(
      z.object({
        token,
        consent: z.boolean(),
        printedName: z.string().trim().min(2, "Type your full name").max(120),
        method: z.enum(["typed", "drawn"]),
        signatureImage: z.string().max(600_000),
      })
    )
    .mutation(({ input: { token, ...data }, ctx }) => esign.submitSignature(token, data, auditFrom(ctx.req))),

  decline: publicProcedure
    .input(z.object({ token, reason: z.string().max(1000) }))
    .mutation(({ input, ctx }) => esign.declineSignature(input.token, input.reason, auditFrom(ctx.req))),
});
