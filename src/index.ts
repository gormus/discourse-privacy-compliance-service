import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { trimTrailingSlash } from "hono/trailing-slash";
import { ApiRouter } from "@/api";
import config from "@/config";
import {
  configResponse,
  errorHandler,
  healthResponse,
  notFoundHandler,
  welcomeResponse,
} from "@/lib/handlers";
import { customLogger } from "@/lib/utils";

const app = new Hono()
  .use(compress())
  .use("*", cors())
  .use("*", etag())
  .use(trimTrailingSlash())
  .use("*", requestId())
  .use(secureHeaders())
  .use(logger(customLogger))
  .onError((err, c) => errorHandler(err, c))
  .notFound((c) => notFoundHandler(c))
  .get("/health", (c) => healthResponse(c))
  .get("/config", (c) => configResponse(c))
  .get("/", (c) => welcomeResponse(c))
  .route("/api", ApiRouter);

serve(
  {
    fetch: app.fetch,
    port: config.PORT,
  },
  (info) => {
    // biome-ignore lint/suspicious/noConsole: Show a message when the server starts
    console.info(`Server is running on port ${info.port}`);
  },
);
