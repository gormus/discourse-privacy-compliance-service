import got, { Options } from "got";
import config from "@/config";

const options = new Options({
  headers: {
    "Api-Key": config.DISCOURSE_API_KEY,
    "Api-Username": config.DISCOURSE_API_USERNAME,
    "Content-Type": "application/json",
    "User-Agent": config.userAgent,
  },
  password: config.DISCOURSE_AUTH_PASSWORD,
  prefixUrl: config.DISCOURSE_API_HOST,
  username: config.DISCOURSE_AUTH_USERNAME,
  // Disable SSL certificate verification in development environments
  // This allows connections to servers with self-signed certificates
  ...(config.isLocal && {
    https: {
      rejectUnauthorized: false,
    },
  }),
  http2: true, // Enable HTTP/2 if supported
  timeout: {
    request: 30000, // 30s total timeout
    response: 15000, // 15s response timeout
  },
});

export const httpClient = got.extend(options);
