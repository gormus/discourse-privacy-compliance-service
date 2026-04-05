import { Hono } from "hono";
import GdprRouter from "@/api/gdpr";

export const ApiRouter = new Hono().route("/gdpr", GdprRouter);
