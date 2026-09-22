import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getLatestRelease } from "@/lib/releases";

export const getLatestReleaseFn = createServerFn({ method: "GET" }).handler(
  async () => {
    // Vercel injects the visitor's ISO country code; CN visitors get the
    // GHProxy mirror as the primary button, everyone else GitHub direct.
    const country = getRequestHeaders().get("x-vercel-ip-country") ?? "";
    const release = await getLatestRelease();
    return { release, primaryId: country === "CN" ? "ghproxy" : "github" };
  },
);
