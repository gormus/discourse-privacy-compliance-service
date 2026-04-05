import { setTimeout } from "node:timers/promises";
import config from "@/config";
import { httpClient } from "@/lib/got";
import { customLogger, rowsToObjects } from "@/lib/utils";
import {
  type ErrorResponse,
  type QueryParams,
  type QueryResult,
  type SuspensionResponse,
  type User,
  type UserEmails,
  userSchema,
} from "@/types";

const TRUST_LEVEL_GROUP_IDS = [
  10,
  11,
  12,
  13,
  14,
];

export const getUserByExternalId = async (
  externalId: string,
  provider: string = "oauth2_basic",
): Promise<User> => {
  return await httpClient
    .get(`u/by-external/${provider}/${externalId}.json`)
    .json();
};

export const getUserById = async (userId: string | number): Promise<User> => {
  return await httpClient.get(`admin/users/${userId}.json`).json();
};

export const getUserByIdCustom = async (
  userId: string | number,
): Promise<User | undefined> => {
  const queryId = config.discourseGetUserByIdQueryId;
  const queryResult = await getExplorerQueryResult(queryId, {
    user_id: userId,
  });
  try {
    const user: User = userSchema.parse(queryResult[0]);
    return user;
  } catch {
    customLogger(`The user with ID# ${userId} could not be found`);
  }
};

export const getExplorerQueryResult = async (
  queryId: number,
  params?: QueryParams,
) => {
  const response: QueryResult = await httpClient
    .post(`admin/plugins/explorer/queries/${queryId}/run`, {
      json: {
        params,
      },
    })
    .json();

  return rowsToObjects(response);
};

export const getUserEmail = async (user: User): Promise<string | null> => {
  const data: UserEmails | ErrorResponse = await httpClient
    .get(`u/${user.username}/emails.json`)
    .json();
  return "email" in data ? data.email : null;
};

export const anonymizeUser = async (user: User): Promise<void> => {
  await httpClient.put(`admin/users/${user.id}/anonymize.json`).json();
};

export const suspendUser = async (user: User): Promise<SuspensionResponse> => {
  const dateSuspended = new Date().toUTCString();
  return await httpClient
    .put(`admin/users/${user.id}/suspend.json`, {
      json: {
        message: `This former employee account was suspended by the Privacy Compliance Service on ${dateSuspended}. If this action is believed to be an error, please contact us.`,
        reason: "Former employee - GDPR data deletion requested",
        suspend_until: "2200-02-02",
      },
    })
    .json();
};

export const deleteUser = async (userId: string | number): Promise<void> => {
  await httpClient.delete(`admin/users/${userId}.json`).json();
};

// Remove user from all groups to prevent access to protected content
export const removeUserFromAllGroups = async (user: User): Promise<void> => {
  const groupRemovalPromises = user.groups
    .filter((group) => !TRUST_LEVEL_GROUP_IDS.includes(group.id))
    .map(async (group) => {
      const searchParams = new URLSearchParams([
        [
          "usernames",
          user.username,
        ],
      ]);

      try {
        // Add delay
        await setTimeout(2000);

        await httpClient
          .delete(`groups/${group.id}/members.json`, {
            searchParams,
          })
          .json();
      } catch (error) {
        // Log but don't fail the entire operation
        customLogger(
          `Failed to remove user ID# ${user.id} from group ${group.name} (${group.id}):`,
          error,
        );
      }
    });

  await Promise.allSettled(groupRemovalPromises);
};

export const addUserToGroup = async (
  user: User,
  groupId: number,
): Promise<void> => {
  await httpClient
    .put(`groups/${groupId}/members.json`, {
      json: {
        usernames: user.username,
      },
    })
    .json();
};

export const updateUser = async (
  user: User,
  updates: Record<string, string | number | boolean>,
): Promise<void> => {
  await httpClient
    .put(`u/${user.username}.json`, {
      json: updates,
    })
    .json();
};

export const downgradeUserTrustLevel = async (user: User): Promise<void> => {
  await httpClient
    .put(`admin/users/${user.id}/trust_level.json`, {
      json: {
        level: 1,
      },
    })
    .json();
};

export const logoutUser = async (user: User): Promise<void> => {
  await httpClient.post(`admin/users/${user.id}/log_out.json`).json();
};

export const gdprProcessNonStaffUser = async (user: User): Promise<void> => {
  await logoutUser(user);
  await removeUserFromAllGroups(user);
  await downgradeUserTrustLevel(user);
  await anonymizeUser(user);
};

export const gdprProcessStaffUser = async (user: User): Promise<void> => {
  await logoutUser(user);
  await removeUserFromAllGroups(user);
  await downgradeUserTrustLevel(user);
  await updateUser(user, {
    title: "Former staff",
  });
  await addUserToGroup(user, config.formerStaffGroupId);
  await suspendUser(user);
};
