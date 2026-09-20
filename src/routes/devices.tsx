import { createFileRoute, redirect } from "@tanstack/react-router";

// The standalone device page was merged into /account — keep the URL as a redirect
// so old links and bookmarks keep working.
export const Route = createFileRoute("/devices")({
  beforeLoad: () => {
    throw redirect({ to: "/account", statusCode: 301 });
  },
});
