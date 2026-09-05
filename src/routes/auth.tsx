import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useT } from "@/i18n";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "登录 AirLane 云端 | AirLane" },
      {
        name: "description",
        content:
          "登录或注册 AirLane 账号，启用云端配置快照、Mesh 共享组、设备管理与 Web 控制台；本地代理能力始终免登录可用。",
      },
      { property: "og:title", content: "登录 AirLane 云端" },
      {
        property: "og:description",
        content: "邮箱或 Google 登录 AirLane，启用云端同步与 Mesh 共享。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signIn" | "signUp" | "reset";

function AuthPage() {
  const t = useT();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account", replace: true });
    });
  }, [navigate]);

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error(String(result.error));
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/account", replace: true });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success(t("auth.resetSent"));
        setMode("signIn");
        return;
      }
      if (mode === "signUp") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success(t("auth.checkEmail"));
          return;
        }
        navigate({ to: "/account", replace: true });
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/account", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  const isReset = mode === "reset";

  return (
    <main className="relative min-h-screen bg-background px-4 py-12">
      <div className="aurora-layer pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="relative mx-auto flex max-w-lg flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-lg font-semibold text-foreground">
            AirLane
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
          <h1 className="font-display text-2xl font-semibold text-card-foreground">
            {isReset
              ? t("auth.resetTitle")
              : mode === "signUp"
                ? t("auth.signUp.title")
                : t("auth.signIn.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isReset
              ? t("auth.resetSubtitle")
              : mode === "signUp"
                ? t("auth.signUp.subtitle")
                : t("auth.signIn.subtitle")}
          </p>

          {!isReset && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
                {(["signIn", "signUp"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      mode === item
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t(item === "signIn" ? "auth.tab.signIn" : "auth.tab.signUp")}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={handleGoogle}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-input bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {t("auth.google")}
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                {t("auth.or")}
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "signUp" && (
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("auth.displayName")}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
            )}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
            />
            {!isReset && (
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
            )}
            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isReset
                ? t("auth.resetSubmit")
                : t(mode === "signUp" ? "auth.submit.signUp" : "auth.submit.signIn")}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isReset ? (
              <button
                type="button"
                onClick={() => setMode("signIn")}
                className="text-primary hover:underline"
              >
                {t("auth.backToSignIn")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="text-muted-foreground hover:text-foreground"
              >
                {t("auth.forgot")}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          {t("auth.localNotice")}
        </p>
      </div>
    </main>
  );
}
