# Discourse Privacy Compliance Service

The GDPR deletion request is handled differently for staff, and regular users.

The request made by the regular users anonymizes their Discourse account, but preserves their contribution, as in topics, posts, reactions, etc.

The requests made for the staff accounts on the other hand are preserved as much as possible. The accounts are suspended indefinitely, the trust level downgraded to 1, stripped membership from all user groups, and finally added to a former staff user group with a matching title.

## Quickstart

- [ ] Create an API key for the `system` user , or another admin role user, get the API key.
- [ ] Import `import/data-explorer.dcquery.json` to Data Explorer in Discourse, and get its ID.
- [ ] Create a user group for **Former staff**, and get the group ID.
- [ ] Copy `example.env` to `.env`, and update environment variables.
- [ ] Open the project in your IDE, using the **Dev Container**

If you are using [OrbStack](https://orbstack.dev/), the application will run at <https://privacy-compliance.orb.local>

## Available API Methods

### GDPR Deletion Request

```http
PUT /api/gdpr/{user_id}
```

### Health status

```http
GET /health
```

### The application configuration

```http
GET /config
```

This is a restricted endpoint, and only works on local development environment.

## Development

- [Hono](https://hono.dev/) - web application framework
- [Prisma ORM](https://www.prisma.io/orm) - database object-relational mapping
- [Got](https://github.com/sindresorhus/got) - HTTP client library
- [Zod](https://zod.dev/) - schema validation library
- Typescript
- Dev Containers
- Biome.js
- ...

This project implements commit linting, based on the [Conventional Commit messages](https://www.conventionalcommits.org/) specs.

Use `pnpm commit` instead of `git commit` to trigger the prompt, for formatted and compliant git commit messages.
