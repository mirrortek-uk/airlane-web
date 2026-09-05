import { createFileRoute } from "@tanstack/react-router";

import { DocsLayout } from "@/routes/docs";

export const Route = createFileRoute("/en/docs")({
  component: DocsLayout,
});
