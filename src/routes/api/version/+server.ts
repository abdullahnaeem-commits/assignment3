import { readFileSync } from "fs";
import { resolve } from "path";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  try {
    const pkg = JSON.parse(
      readFileSync(resolve("package.json"), "utf-8")
    );

    return Response.json({
      name: pkg.name,
      version: pkg.version,
      node: process.version,
    });
  } catch {
    return Response.json({ version: "unknown" });
  }
};
