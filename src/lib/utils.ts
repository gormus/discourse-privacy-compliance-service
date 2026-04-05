import type { QueryResult } from "@/types";
import config from "@/config";

// biome-ignore lint/suspicious/noExplicitAny: Allow any type for logging purposes
export const customLogger = (...data: any[]): void => {
  // biome-ignore lint/suspicious/noConsole: Custom logger
  console.log(...data);
};

export function isStaff(email: string): boolean {
  if (!email || typeof email !== "string") return false;

  const normalized = email.trim().toLowerCase();
  const emailDomain = normalized.split("@").pop();

  if (!emailDomain) return false;

  const staffDomains = new Set(config.staffEmailDomains);

  return staffDomains.has(emailDomain);
}

export const rowsToObjects = (response: QueryResult) => {
  return response.rows.map((row) => {
    const obj = {} as Record<string, string | number | boolean | null>;

    response.columns.forEach((col, i) => {
      let value = row[i];

      if (
        typeof value === "string" &&
        value.startsWith("[") &&
        value.endsWith("]")
      ) {
        try {
          value = JSON.parse(value);
        } catch {}
      }

      obj[col] = value ?? null;
    });

    return obj;
  });
};
