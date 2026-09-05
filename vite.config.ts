// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Lovable's envDefine uses loadEnv() which only reads .env files. On Vercel (and other
// CI hosts) env vars are injected via process.env with no .env file, so VITE_* vars
// never reach the client bundle. Supplement define with process.env values so the
// client build gets them regardless of where it runs.
const processEnvDefine = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key]) => key.startsWith("VITE_"))
    .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
);

// Debug: log which VITE_ vars are visible at build time
console.log(`[vite.config] processEnvDefine keys: ${Object.keys(processEnvDefine).join(", ") || "(none)"}`);

export default defineConfig({
  // Lovable defaults to Cloudflare Workers; deploy this site on Vercel instead.
  cloudflare: false,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
  vite: {
    define: processEnvDefine,
  },
});
