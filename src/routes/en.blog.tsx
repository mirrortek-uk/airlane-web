import { createFileRoute } from "@tanstack/react-router";

import { BlogLayout } from "@/routes/blog";

export const Route = createFileRoute("/en/blog")({
  component: BlogLayout,
});
