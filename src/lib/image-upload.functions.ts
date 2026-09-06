import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Upload an image to the GitHub repo's public/images/ directory.
 * The image is served via jsDelivr CDN: https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/images/<path>
 *
 * Requires GITHUB_TOKEN environment variable with repo write access.
 */
export const uploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      filename: z.string().min(1),
      base64: z.string().min(1),
      subdir: z.string().default("blog"),
    }),
  )
  .handler(async ({ data }) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN is not configured on the server");
    }

    const repo = "mirrortek-uk/airlane-web";
    const branch = "main";
    // Sanitize subdir and filename to prevent path traversal
    const safeSubdir = data.subdir.replace(/[^a-zA-Z0-9-_]/g, "");
    const safeFilename = data.filename.replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `public/images/${safeSubdir}/${safeFilename}`;

    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload image: ${path}`,
        content: data.base64,
        branch,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`GitHub API error: ${resp.status} ${text}`);
    }

    const json = await resp.json();
    // jsDelivr CDN URL — free, unlimited bandwidth, global cache
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${repo}@${branch}/${path}`;

    return {
      url: cdnUrl,
      path,
      sha: json.content?.sha,
    };
  });
