import type { Context, Next } from "hono";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "@/config";
import { customLogger } from "@/lib/utils";
import { PrismaClient } from "@/prisma-generated/client";

// Create singleton Prisma instance
let prisma: PrismaClient;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const adapter = new PrismaPg({
      connectionString: config.DATABASE_URL,
    });

    if (config.isLocal) {
      prisma = new PrismaClient({
        adapter,
        log: [
          {
            emit: "event",
            level: "query",
          },
          {
            emit: "stdout",
            level: "error",
          },
          {
            emit: "stdout",
            level: "info",
          },
          {
            emit: "stdout",
            level: "warn",
          },
        ],
      });

      // biome-ignore lint/suspicious/noExplicitAny: Enable logging for query events
      (prisma as any).$on("query", (e: any) => {
        customLogger(e);
      });
    } else {
      prisma = new PrismaClient({
        adapter,
        log: [],
      });
    }
  }
  return prisma;
}

type ContextWithPrisma = {
  Variables: {
    prisma: PrismaClient;
  };
};

const withPrisma = (c: Context, next: Next) => {
  if (!c.get("prisma")) {
    c.set("prisma", getPrismaClient());
  }
  return next();
};

export default withPrisma;
export type { ContextWithPrisma };
