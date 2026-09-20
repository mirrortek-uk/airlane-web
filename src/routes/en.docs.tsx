import { createFileRoute } from "@tanstack/react-router";

import { DocsLayout, loadDocsNav } from "@/routes/docs";

export const Route = createFileRoute("/en/docs")({
  loader: () => loadDocsNav(),
  component: DocsLayout,
});
