/** biome-ignore-all assist/source/useSortedKeys: Do not sort JSON fields */
import process from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "@/config";
import { type Prisma, PrismaClient } from "@/prisma-generated/client";

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
});

const privacyActionData: Prisma.PrivacyActionCreateInput[] = [
  {
    id: "56bbc279-8cd9-41cc-9115-262187d83e5a",
    userId: 1,
    externalUserId: "external-1",
    actionType: "DELETED",
    actionDate: new Date("2014-12-20T21:17:56.891Z"),
  },
  {
    id: "e7468f3f-bd80-4b32-87ce-9a8d717db436",
    userId: 2,
    actionType: "ANONYMIZED",
    actionDate: new Date("2014-12-20T21:17:56.891Z"),
  },
  {
    id: "2d8e32e4-6da2-4a40-9527-94bd69d80d22",
    userId: 3,
    externalUserId: "external-3",
    actionType: "SUSPENDED",
    actionDate: new Date("2014-12-20T21:17:50.311Z"),
  },
  {
    id: "9bf99ca5-636a-494a-84f0-85d08edad715",
    userId: 4,
    actionType: "DELETED",
    actionDate: new Date("2014-12-20T21:17:50.313Z"),
  },
  {
    id: "c1e5b8c7-9a3e-4f0b-9c8e-1a2b3c4d5e6f",
    userId: 5,
    externalUserId: "external-5",
    actionType: "ANONYMIZED",
    actionDate: new Date("2014-12-20T21:17:50.315Z"),
  },
  {
    id: "5c33f583-0026-4419-824c-7bc176c9efe9",
    userId: 6,
    externalUserId: "external-6",
    actionType: "DELETED",
    actionDate: new Date("2014-12-20T21:17:50.317Z"),
  },
  {
    id: "605dd683-0f53-4473-9ffd-e8d5e6883386",
    userId: 7,
    externalUserId: "external-7",
    actionType: "ANONYMIZED",
    actionDate: new Date("2014-12-20T21:17:50.319Z"),
  },
  {
    id: "db49e5df-14e0-4b5d-b6bb-4a77faed0d51",
    userId: 8,
    actionType: "SUSPENDED",
    actionDate: new Date("2014-12-20T21:17:50.321Z"),
  },
  {
    id: "bfda167e-8f5e-4f1d-8e96-44fb01079f96",
    userId: 9,
    externalUserId: "external-9",
    actionType: "DELETED",
    actionDate: new Date("2014-12-20T21:17:50.323Z"),
  },
  {
    id: "87bf86c5-5138-4a59-9caf-548f727c0883",
    userId: 10,
    externalUserId: "external-10",
    actionType: "ANONYMIZED",
    actionDate: new Date("2014-12-20T21:17:50.325Z"),
  },
];

export async function main() {
  for (const i of privacyActionData) {
    await prisma.privacyAction.create({
      data: i,
    });
  }
}

main()
  .catch((error) => {
    // biome-ignore lint/suspicious/noConsole: Logging errors to the console for debugging purposes
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
