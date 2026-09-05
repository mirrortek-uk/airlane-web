import { createFileRoute, Outlet } from "@tanstack/react-router";

// English locale layout route.
// All /en/* routes render through this wrapper, which ensures the i18n
// provider detects "en" from the URL path prefix.
export const Route = createFileRoute("/en")({
  component: () => <Outlet />,
});
