import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/turnstile";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/i18n";
import { writeGuestToken } from "@/lib/guest";
import { createGuestSession } from "@/lib/account.functions";
import { recoverAnonymousIdentity } from "@/lib/identity.functions";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "登录 AirLane 云端 | AirLane" },
      {
        name: "description",
        content:
          "登录或注册 AirLane 账号，启用云端配置快照、Mesh 共享组、设备管理与 Web 控制台；本地代理能力始终免登录可用。",
      },
      { property: "og:title", content: "登录 AirLane 云端" },
      {
        property: "og:description",
        content: "邮箱密码或邮箱验证码登录 AirLane，启用云端同步与 Mesh 共享。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signIn" | "signUp" | "reset";
type AuthMethod = "password" | "otp";

function AuthPage() {
  const t = useT();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signIn");
  const [method, setMethod] = useState<AuthMethod>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [anonRecovery, setAnonRecovery] = useState<string | null>(null);
  const [showRecover, setShowRecover] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account", replace: true });
    });
  }, [navigate]);

  // Handle OAuth redirect callback (magic link / OTP verification)
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/account", replace: true });
    });
  }, [navigate]);

  async function startAnonymous() {
    setBusy(true);
    try {
      const session = await createGuestSession({
        data: { captchaToken: captchaToken ?? undefined },
      });
      writeGuestToken(session.token);
      setAnonRecovery(session.recoveryCode);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleRecover(event: React.FormEvent) {
    event.preventDefault();
    if (!recoveryInput.trim()) return;
    setBusy(true);
    try {
      const result = await recoverAnonymousIdentity({
        data: { recoveryCode: recoveryInput },
      });
      if (!result.ok) {
        toast.error(t("auth.anon.recoverInvalid"));
        return;
      }
      writeGuestToken(result.token);
      toast.success(t("auth.anon.recoverOk"));
      navigate({ to: "/account", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleSendOtp(event: React.FormEvent) {
    event.preventDefault();
    if (!email) {
      toast.error(t("auth.emailRequired"));
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          // Always create the user on first OTP login — no separate signup step
          // for the email-code flow. Supabase sends the OTP login email only.
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setOtpSent(true);
      toast.success(t("auth.otpSent"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !otpCode) {
      toast.error(t("auth.otpRequired"));
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      });
      if (error) throw error;
      navigate({ to: "/account", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
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
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        // Supabase returns an obfuscated user with empty identities when the
        // email is already registered — no confirmation email is sent in that
        // case, so tell the user to sign in instead of waiting for a mail.
        if (!data.session && (data.user?.identities?.length ?? 0) === 0) {
          toast.error(t("auth.emailTaken"));
          setMode("signIn");
          return;
        }
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
  const isOtp = method === "otp" && mode === "signIn" && !isReset;

  async function handleGoogle() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
      // Redirects away; onAuthStateChange handles the return.
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-background px-4 py-12">
      <div className="aurora-layer pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="relative mx-auto flex max-w-lg flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="AirLane">
            <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
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
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-input bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                <GoogleIcon />
                {t("auth.google")}
              </button>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                {t("auth.or")}
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
                {(["signIn", "signUp"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMode(item);
                      setOtpSent(false);
                      if (item === "signUp") setMethod("password");
                    }}
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

              {/* Auth method toggle: password vs OTP — sign-in only,
                  sign-up is password-only (OTP auto-creates on sign-in) */}
              {mode === "signIn" && (
                <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-muted/50 p-1">
                  {(["password", "otp"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMethod(m); setOtpSent(false); }}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                        method === m
                          ? "bg-ink text-cream"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t(m === "password" ? "auth.method.password" : "auth.method.otp")}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* OTP method */}
          {isOtp ? (
            otpSent ? (
              <form onSubmit={handleVerifyOtp} className="mt-5 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {t("auth.otpEnterCode")} <span className="font-medium text-foreground">{email}</span>
                </p>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-lg font-mono tracking-widest text-foreground outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy ? t("auth.verifying") : t("auth.verifyOtp")}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  {t("auth.otpResend")}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSendOtp} className="mt-5 flex flex-col gap-3">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy ? t("auth.sending") : t("auth.sendOtp")}
                </button>
              </form>
            )
          ) : (
            /* Password method */
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
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
          )}

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

        {/* Anonymous identity — no email required */}
        <div className="rounded-3xl border border-dashed border-border bg-card/70 p-6">
          <h2 className="font-display text-lg font-semibold text-card-foreground">
            {t("auth.anon.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.anon.desc")}</p>

          {anonRecovery ? (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("auth.anon.recoveryTitle")}
              </p>
              <p className="mt-2 rounded-2xl bg-muted px-4 py-3 text-center font-mono text-xl font-semibold tracking-[0.15em] text-foreground">
                {anonRecovery}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-amber-600">
                {t("auth.anon.recoveryWarning")}
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/account", replace: true })}
                className="mt-3 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t("auth.anon.recoveryConfirm")}
              </button>
            </div>
          ) : (
            <>
              <Turnstile onVerify={setCaptchaToken} />
              <button
                type="button"
                onClick={startAnonymous}
                disabled={busy || (TURNSTILE_ENABLED && !captchaToken)}
                className="mt-4 w-full rounded-full border border-input bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {busy ? t("auth.anon.creating") : t("auth.anon.button")}
              </button>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {t("auth.anon.note")}
              </p>

              <button
                type="button"
                onClick={() => setShowRecover((v) => !v)}
                className="mt-3 text-sm text-primary hover:underline"
              >
                {t("auth.anon.recoverLink")}
              </button>
              {showRecover && (
                <form onSubmit={handleRecover} className="mt-3 flex flex-col gap-2">
                  <input
                    type="text"
                    required
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    placeholder={t("auth.anon.recoverPlaceholder")}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-center font-mono text-sm tracking-widest text-foreground outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
                  >
                    {t("auth.anon.recoverButton")}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          {t("auth.localNotice")}
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
