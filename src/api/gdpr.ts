import { Hono } from "hono";
import * as DiscourseApi from "@/lib/discourse";
import withPrisma, { type ContextWithPrisma } from "@/lib/prisma";
import { isStaff } from "@/lib/utils";

const GdprRouter = new Hono<ContextWithPrisma>().put(
  "/:userId",
  withPrisma,
  async (c) => {
    const userIdParam = c.req.param("userId");

    const userId =
      typeof userIdParam === "string"
        ? Number(userIdParam.trim())
        : userIdParam;

    if (!userId) {
      return c.json(
        {
          message: "A valid user ID is required",
        },
        400,
      );
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      return c.json(
        {
          message: "User ID must be a positive integer",
        },
        400,
      );
    }

    const user = await DiscourseApi.getUserByIdCustom(userId);

    if (!user) {
      return c.json(
        {
          message: "User not found",
        },
        404,
      );
    }

    if (user.admin || user.moderator) {
      return c.json(
        {
          message:
            "Processing admin or moderator accounts for GDPR data deletion is not allowed.",
        },
        403,
      );
    }

    const isProtectedUser = isStaff(user.email);

    if (isProtectedUser) {
      await DiscourseApi.gdprProcessStaffUser(user);
    } else {
      await DiscourseApi.gdprProcessNonStaffUser(user);
    }

    const prisma = c.get("prisma");
    await prisma.privacyAction.create({
      data: {
        actionType: "GDPR_DELETE_REQUEST",
        externalUserId: user.provider_uid,
        userId: userId,
      },
    });

    return c.json({
      message: `User account with ID ${userId} has been processed for GDPR data deletion.`,
    });
  },
);

export default GdprRouter;
