import { createServerFn } from "@tanstack/react-start";
import { getLatestRelease } from "@/lib/releases";

export const getLatestReleaseFn = createServerFn({ method: "GET" }).handler(
  async () => getLatestRelease(),
);
