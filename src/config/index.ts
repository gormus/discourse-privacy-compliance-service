import process, { loadEnvFile } from "node:process";
import * as z from "zod";
// Do not re-map the import path for package.json as Prisma cannot resolve the path when generating the client.
import packageJson from "./../../package.json" with { type: "json" };

// Loads environment variables from .env when present.
// In staging/production, env vars are injected by the host — no .env file expected.
try {
  loadEnvFile();
} catch {
  // Intentionally silent: missing .env is normal outside local development.
}

/**
 * Schema for environment variables.
 */
const EnvironmentSchema = z.object({
  DATABASE_URL: z
    .url()
    .default(
      "postgresql://postgres:postgres@localhost:5432/postgres?schema=public",
    ),
  DISCOURSE_API_HOST: z.url(),
  DISCOURSE_API_KEY: z.string().min(1),
  DISCOURSE_API_USERNAME: z.string().min(1),
  DISCOURSE_AUTH_PASSWORD: z.string().default(""),
  DISCOURSE_AUTH_USERNAME: z.string().default(""),
  DISCOURSE_GET_USER_BY_ID_EXPLORER_QUERY_ID: z.coerce
    .number()
    .int()
    .positive(),
  FORMER_STAFF_GROUP_ID: z.coerce.number().int().positive(),
  LOG_LEVEL: z
    .enum([
      "fatal",
      "error",
      "warn",
      "info",
      "debug",
      "trace",
      "silent",
    ])
    .default("info"),
  NODE_ENV: z
    .enum([
      "development",
      "testing",
      "staging",
      "production",
    ])
    .default("development"),
  PAGE_SIZE: z.coerce.number().int().positive().default(20),
  PORT: z.coerce.number().int().positive().default(8080),
  STAFF_EMAIL_DOMAINS: z.string().default(""),
});

const envVars = EnvironmentSchema.safeParse(process.env);

if (!envVars.success) {
  const pretty = z.prettifyError(envVars.error);
  // biome-ignore lint/suspicious/noConsole: startup validation failure
  console.error("Environment variable validation failed:\n\n", pretty);
  process.exit(1);
}

/**
 * Schema for the derived configuration object.
 * Extends the raw env schema with computed/aliased fields.
 */
const ConfigSchema = EnvironmentSchema.extend({
  isLocal: z.boolean(),
  isProduction: z.boolean(),
  isStaging: z.boolean(),
  isTesting: z.boolean(),
  staffEmailDomains: z.array(z.string()),
  userAgent: z.string().min(1),
});

export type Config = z.infer<typeof ConfigSchema>;

const env = envVars.data;
const userAgent = `${packageJson.name}/${packageJson.version} (${packageJson.author.url})`;

const configAll: Config = {
  ...env,
  isLocal: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isStaging: env.NODE_ENV === "staging",
  isTesting: env.NODE_ENV === "testing",
  staffEmailDomains:
    env.STAFF_EMAIL_DOMAINS.length > 0
      ? env.STAFF_EMAIL_DOMAINS.split("|").map((d) => d.trim().toLowerCase())
      : [],
  userAgent,
};

const configParsed = ConfigSchema.safeParse(configAll);

if (!configParsed.success) {
  const pretty = z.prettifyError(configParsed.error);
  // biome-ignore lint/suspicious/noConsole: startup validation failure
  console.error("Configuration construction failed:\n\n", pretty);
  process.exit(1);
}

const config: Config = configParsed.data;

export default config;
