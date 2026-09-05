import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/en/docs")({
  component: () => <Outlet />,
});
