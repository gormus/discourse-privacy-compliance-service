import process, { loadEnvFile } from "node:process";
import * as z from "zod";
// Do not re-map the import path for package.json as Prisma cannot resolve the path when generating the client.
import packageJson from "./../../package.json" with { type: "json" };

// Loads environment variables from the default .env file
loadEnvFile();

/**
 * Schema for environment variables
 */
const EnvironmentSchema = z.object({
  DATABASE_URL: z
    .url()
    .default(
      "postgresql://postgres:postgres@localhost:5432/postgres?schema=public",
    ),
  DISCOURSE_API_HOST: z.url(),
  DISCOURSE_API_KEY: z.string(),
  DISCOURSE_API_USERNAME: z.string(),
  DISCOURSE_AUTH_PASSWORD: z.string().default(""),
  DISCOURSE_AUTH_USERNAME: z.string().default(""),
  DISCOURSE_GET_USER_BY_ID_EXPLORER_QUERY_ID: z.coerce.number(),
  FORMER_STAFF_GROUP_ID: z.coerce.number(),
  LOG_LEVEL: z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ]),
  NODE_ENV: z
    .enum([
      "development",
      "testing",
      "staging",
      "production",
    ])
    .default("development"),
  PAGE_SIZE: z.coerce.number().optional(),
  PORT: z.coerce.number().default(8080),
  STAFF_EMAIL_DOMAINS: z.string().default(""),
});

// Parse environment variables to validate and apply defaults
const envVars = EnvironmentSchema.safeParse(process.env);

// Handle environment variable parsing errors
if (!envVars.success) {
  const pretty = z.prettifyError(envVars.error);
  // biome-ignore lint/suspicious/noConsole: Environment variable parsing error
  console.error("Something went wrong with environment variables:\n\n", pretty);
  process.exit(1);
}

/**
 * Schema for main configuration
 */
const ConfigSchema = EnvironmentSchema.extend({
  discourseGetUserByIdQueryId: z.coerce.number(),
  formerStaffGroupId: z.number(),
  isLocal: z.boolean(),
  isProduction: z.boolean(),
  isStaging: z.boolean(),
  isTesting: z.boolean(),
  pageSize: z.number().default(20),
  staffEmailDomains: z.array(z.string()),
  userAgent: z.string(),
});

// Construct user agent string
const userAgent: string = `${packageJson.name}/${packageJson.version} (${packageJson.author.url})`;

/**
 * Main configuration object
 */
const config: Config = {
  ...envVars.data,
  discourseGetUserByIdQueryId:
    envVars.data.DISCOURSE_GET_USER_BY_ID_EXPLORER_QUERY_ID,
  formerStaffGroupId: envVars.data.FORMER_STAFF_GROUP_ID,
  isLocal: envVars.data.NODE_ENV === "development",
  isProduction: envVars.data.NODE_ENV === "production",
  isStaging: envVars.data.NODE_ENV === "staging",
  isTesting: envVars.data.NODE_ENV === "testing",
  pageSize: envVars.data.PAGE_SIZE || 20,
  staffEmailDomains:
    envVars.data.STAFF_EMAIL_DOMAINS.length > 0
      ? envVars.data.STAFF_EMAIL_DOMAINS.split("|").map((domain) =>
          domain.trim().toLowerCase(),
        )
      : [],
  userAgent,
};

export default config;

export type Config = z.infer<typeof ConfigSchema>;
