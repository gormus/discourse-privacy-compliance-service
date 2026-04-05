# Data Explorer Query

This query is required as part of the application.

Either import the `*.dcquery.json`, or manually create a Data Explorer Query using the code below:

## Privacy Compliance Service - Get User by ID

```sql
-- [params]
-- int :user_id

SELECT
    u.id,
    u.username,
    ue.email,
    uaa.provider_name,
    uaa.provider_uid,
    u.admin,
    u.moderator,
    u.trust_level,
    u.title,
    u.primary_group_id,
    jsonb_agg(
        jsonb_build_object('id', gu.group_id, 'name', g.name) ORDER BY gu.group_id ASC
    ) AS groups

FROM
    users u
    LEFT JOIN user_emails ue ON ue.user_id = u.id
    LEFT JOIN user_associated_accounts uaa ON uaa.user_id = u.id
    LEFT JOIN group_users gu ON gu.user_id = u.id
    LEFT JOIN groups g ON g.id = gu.group_id
WHERE
    u.id > 0
    AND ue.primary = TRUE
    AND (u.id = :user_id OR :user_id IS NULL)
GROUP BY
    u.id,
    u.username,
    ue.email,
    uaa.provider_name,
    uaa.provider_uid,
    u.admin,
    u.moderator,
    u.trust_level,
    u.title,
    u.primary_group_id
LIMIT 1
```
