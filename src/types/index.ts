import { z } from "zod";

export const userSchema = z.object({
  admin: z.boolean(),
  email: z.string(),
  groups: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    }),
  ),
  id: z.number(),
  moderator: z.boolean(),
  primary_group_id: z.number().nullable(),
  provider_name: z.string().nullable(),
  provider_uid: z.string().nullable(),
  title: z.string().nullable(),
  trust_level: z.number(),
  username: z.string(),
});
export type User = z.infer<typeof userSchema>;

const rowSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
  ]),
);
export type RowSchema = z.infer<typeof rowSchema>;

export type QueryParams = z.infer<typeof rowSchema>;

const queryResult = z.object({
  colrender: z.record(z.string(), z.string()).optional(),
  columns: z.array(z.string()),
  errors: z.array(z.string()),
  params: z.record(
    z.string(),
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
    ]),
  ),
  rows: z.array(
    z.array(
      z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
      ]),
    ),
  ),
  success: z.boolean(),
});
export type QueryResult = z.infer<typeof queryResult>;

const userEmails = z.object({
  associated_accounts: z.array(z.email()),
  email: z.email(),
  secondary_emails: z.array(z.email()),
  unconfirmed_emails: z.array(z.email()),
});
export type UserEmails = z.infer<typeof userEmails>;

const errorResponse = z.object({
  error_type: z.string(),
  errors: z.array(z.string()),
});
export type ErrorResponse = z.infer<typeof errorResponse>;

const suspensionResponse = z.object({
  full_suspend_reason: z.string(),
  suspend_reason: z.string(),
  suspended_at: z.string(),
  suspended_by: z.object({
    avatar_template: z.string(),
    id: z.number(),
    name: z.string(),
    username: z.string(),
  }),
  suspended_till: z.string(),
});
export type SuspensionResponse = z.infer<typeof suspensionResponse>;

const demotedUser = z.object({
  skipped_usernames: z.array(z.string()),
  success: z.string(),
  usernames: z.array(z.string()),
});
export type DemotedUser = z.infer<typeof demotedUser>;
