import type { PrismaConfig } from "prisma";
import config from "./src/config/index.ts";

export default {
  datasource: {
    url: config.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  schema: "prisma/schema.prisma",
} satisfies PrismaConfig;
