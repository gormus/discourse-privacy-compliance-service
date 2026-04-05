import type { Context } from "hono";
import config from "@/config";
import { customLogger } from "@/lib/utils";

export const notFoundHandler = (c: Context) => {
  return c.json(
    {
      message: "Not Found",
    },
    404,
  );
};

export const errorHandler = (err: Error, c: Context) => {
  customLogger(err);
  return c.json(
    {
      message: "Internal Server Error",
      "request-id": c.get("requestId"),
    },
    500,
  );
};

export const healthResponse = (c: Context) => {
  return c.json({
    status: "ok",
  });
};

export const configResponse = (c: Context) => {
  if (config.isLocal) {
    return c.json(config);
  }
  return c.json(
    {
      message: "Forbidden",
    },
    403,
  );
};

export const welcomeResponse = (c: Context) => {
  return c.json({
    message: "Discourse Privacy Compliance Service",
  });
};
