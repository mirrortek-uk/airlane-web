import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/i18n";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "重置 AirLane 密码 | AirLane" },
      { name: "description", content: "为你的 AirLane 云端账号设置新密码。" },
      { property: "og:title", content: "重置 AirLane 密码" },
      { property: "og:description", content: "为你的 AirLane 云端账号设置新密码。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const t = useT();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(t("auth.passwordUpdated"));
      await supabase.auth.signOut();
      navigate({ to: "/auth", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-background px-4 py-12">
      <div className="relative mx-auto flex max-w-md flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="AirLane">
            <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
          <h1 className="font-display text-2xl font-semibold text-card-foreground">
            {t("auth.resetTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("auth.needRecovery")}</p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.newPassword")}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {t("auth.updatePassword")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
