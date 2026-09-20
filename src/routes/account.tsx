import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, X, Cloud, ShieldCheck, User, Server, Globe, XIcon, Laptop } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/turnstile";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/i18n";
import { clearGuestToken, readGuestToken, writeGuestToken } from "@/lib/guest";
import { ACCOUNT_LIMITS, recoverAnonymousIdentity } from "@/lib/identity.functions";
import {
  createAccountPairingCode,
  createGuestSession,
  createPairingCode,
  endGuestSession,
  getAccountOverview,
  getGuestSession,
  removeDevice,
  removeGuestDevice,
  upgradeGuestSession,
} from "@/lib/account.functions";
import { rotateRecoveryCode } from "@/lib/identity.functions";

export const Route = createFileRoute("/account")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "账号中心 | AirLane 云端身份" },
      {
        name: "description",
        content:
          "AirLane 四种身份：完全本地、匿名体验、正式主账号与子账号。查看配额、设备与云端能力，本地代理始终 100% 可用。",
      },
      { property: "og:title", content: "AirLane 账号中心" },
      {
        property: "og:description",
        content: "完全本地、匿名体验、正式账号与子账号，四种身份一页管理。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

type Overview = Awaited<ReturnType<typeof getAccountOverview>>;
type GuestState = Awaited<ReturnType<typeof getGuestSession>>;

function AccountPage() {
  const t = useT();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [guest, setGuest] = useState<GuestState | null>(null);
  const [pendingGuestToken, setPendingGuestToken] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [anonOpen, setAnonOpen] = useState(false);
  const [anonMode, setAnonMode] = useState<"login" | "create">("login");
  const [anonRecoveryInput, setAnonRecoveryInput] = useState("");
  const [createdRecovery, setCreatedRecovery] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = readGuestToken();
      if (data.session) {
        const result = await getAccountOverview();
        setOverview(result);
        setGuest(null);
        setPendingGuestToken(token);
        return;
      }
      setOverview(null);
      if (token) {
        const state = await getGuestSession({ data: { token } });
        if (state.valid) {
          setGuest(state);
        } else {
          clearGuestToken();
          setGuest(null);
        }
      } else {
        setGuest(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function startGuest() {
    setBusy(true);
    try {
      const session = await createGuestSession({
        data: { captchaToken: captchaToken ?? undefined },
      });
      writeGuestToken(session.token);
      setRecoveryCode(session.recoveryCode);
      setCreatedRecovery(session.recoveryCode);
      toast.success(t("account.guest.created"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function recoverAnon(event: FormEvent) {
    event.preventDefault();
    if (!anonRecoveryInput.trim()) return;
    setBusy(true);
    try {
      const result = await recoverAnonymousIdentity({
        data: { recoveryCode: anonRecoveryInput },
      });
      if (!result.ok) {
        toast.error(t("auth.anon.recoverInvalid"));
        return;
      }
      writeGuestToken(result.token);
      toast.success(t("auth.anon.recoverOk"));
      setAnonOpen(false);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function confirmAnonRecovery() {
    setAnonOpen(false);
    setCreatedRecovery(null);
    await refresh();
  }

  async function rotateRecovery() {
    const token = readGuestToken();
    if (!token) return;
    setBusy(true);
    try {
      const result = await rotateRecoveryCode({ data: { token } });
      if (result.ok) {
        setRecoveryCode(result.recoveryCode);
        toast.success(t("account.guest.recoveryRotated"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function exitGuest() {
    const token = readGuestToken();
    if (!token) return;
    setBusy(true);
    try {
      await endGuestSession({ data: { token } });
      clearGuestToken();
      toast.success(t("account.guest.ended"));
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function migrateGuest() {
    if (!pendingGuestToken) return;
    setBusy(true);
    try {
      const result = await upgradeGuestSession({ data: { token: pendingGuestToken } });
      clearGuestToken();
      setPendingGuestToken(null);
      if (result.ok) toast.success(t("account.guest.upgraded"));
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const profile = overview?.profile ?? null;
  const isMember = profile?.account_role === "member";

  return (
    <main className="relative min-h-screen bg-background px-4 py-12">
      <div className="aurora-layer pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="AirLane">
            <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </header>

        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {t("account.title")}
          </h1>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t("account.loading")}</p>
        ) : profile ? (
          <section className="rounded-3xl border border-border bg-card p-8 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                {isMember ? <User size={18} /> : <ShieldCheck size={18} />}
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-card-foreground">
                  {t(isMember ? "account.state.member" : "account.state.account")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isMember
                    ? t("account.state.memberDesc", {
                        parent: overview?.parentEmail ?? "—",
                      })
                    : t("account.state.accountDesc")}
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label={t("account.field.email")} value={profile.email ?? "—"} />
              <Field
                label={t("account.field.plan")}
                value={t(profile.plan === "pro" ? "account.plan.pro" : "account.plan.free")}
              />
              <Field
                label={t("account.field.role")}
                value={t(isMember ? "account.role.member" : "account.role.owner")}
              />
              {isMember && (
                <Field label={t("account.field.parent")} value={overview?.parentEmail ?? "—"} />
              )}
            </dl>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <Stat
                label={t("account.usage.snapshots")}
                value={`${overview?.counts.snapshots ?? 0} / ${ACCOUNT_LIMITS[profile.plan === "pro" ? "pro" : "free"].configTemplates}`}
              />
              <Stat
                label={t("account.usage.devices")}
                value={`${overview?.devices.length ?? 0} / ${ACCOUNT_LIMITS[profile.plan === "pro" ? "pro" : "free"].devices}`}
              />
              <Stat label={t("account.usage.favorites")} value={overview?.counts.favorites ?? 0} />
              <Stat label={t("account.usage.groups")} value={overview?.counts.groups ?? 0} />
            </div>

            {pendingGuestToken && (
              <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-foreground">{t("account.guest.pending")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={migrateGuest}
                    disabled={busy}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {t("account.guest.migrate")}
                  </button>
                  <button
                    onClick={() => setPendingGuestToken(null)}
                    className="rounded-full border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    {t("account.guest.discard")}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={signOut}
                className="rounded-full border border-input px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
              >
                {t("account.action.signOut")}
              </button>
            </div>
          </section>
        ) : guest?.valid ? (
          <section className="rounded-3xl border border-border bg-card p-8 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                <Cloud size={18} />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-card-foreground">
                  {t("account.state.guest")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("account.state.guestDesc")}</p>
              </div>
            </div>

            <p className="mt-4 rounded-2xl bg-muted p-4 text-sm text-foreground">
              {t("account.guest.warning")}
            </p>

            {recoveryCode && (
              <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  {t("account.guest.recoveryTitle")}
                </p>
                <p className="mt-2 text-center font-mono text-xl font-semibold tracking-[0.15em] text-foreground">
                  {recoveryCode}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-amber-700">
                  {t("account.guest.recoveryHint")}
                </p>
              </div>
            )}

            <p className="mt-4 font-mono text-xs text-muted-foreground">
              {t("account.guest.idLabel")}: {guest.id}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t("account.guest.expires")}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat
                label={t("account.usage.devices")}
                value={`${guest.usage.devices} / ${guest.limits.devices}`}
              />
              <Stat
                label={t("account.usage.sharedVps")}
                value={`${guest.usage.sharedVps} / ${guest.limits.sharedVps}`}
              />
              <Stat
                label={t("account.usage.residentialIp")}
                value={`${guest.usage.residentialIp} / ${guest.limits.residentialIp}`}
              />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <List
                title={t("account.guest.allowed")}
                tone="ok"
                items={[
                  t("account.guest.allow1", { n: guest.limits.devices }),
                  t("account.guest.allow2"),
                  t("account.guest.allow3", { n: guest.limits.sharedVps }),
                  t("account.guest.allow4", { n: guest.limits.residentialIp }),
                  t("account.guest.allow5"),
                ]}
              />
              <List
                title={t("account.guest.blocked")}
                tone="no"
                items={[
                  t("account.guest.block1"),
                  t("account.guest.block2"),
                  t("account.guest.block3"),
                  t("account.guest.block4"),
                  t("account.guest.block5"),
                ]}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t("account.action.upgrade")}
              </Link>
              <button
                onClick={rotateRecovery}
                disabled={busy}
                className="rounded-full border border-input px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-60"
              >
                {t("account.guest.rotateRecovery")}
              </button>
              <button
                onClick={exitGuest}
                disabled={busy}
                className="rounded-full border border-input px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-60"
              >
                {t("account.action.exitGuest")}
              </button>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                  <Cloud size={18} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-card-foreground">
                    {t("account.local.guestTitle")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("account.local.guestDesc")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAnonMode("login");
                  setCreatedRecovery(null);
                  setAnonRecoveryInput("");
                  setAnonOpen(true);
                }}
                className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {t("account.action.tryGuest")}
              </button>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-card-foreground">
                    {t("account.local.accountTitle")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("account.local.accountDesc")}
                  </p>
                </div>
              </div>
              <Link
                to="/auth"
                className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t("account.action.signIn")}
              </Link>
            </div>
          </section>
        )}

        <DeviceManager
          identity={profile ? "account" : guest?.valid ? "guest" : "none"}
          devices={
            profile
              ? (overview?.devices ?? [])
              : guest?.valid
                ? (guest.devices as DeviceItem[])
                : []
          }
          deviceLimit={guest?.valid ? guest.limits.devices : undefined}
          onChanged={refresh}
        />

        <SharedResources />

        <p className="rounded-2xl border border-border bg-muted/60 p-4 text-sm text-foreground">
          {t("account.rule")}
        </p>
      </div>

      {anonOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
          onClick={() => setAnonOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label={t("account.anon.close")}
              onClick={() => setAnonOpen(false)}
              className="absolute right-5 top-5 text-muted-foreground hover:text-foreground"
            >
              <XIcon size={18} />
            </button>

            <h2 className="font-display text-2xl font-semibold text-card-foreground">
              {t("account.anon.title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("account.anon.desc")}</p>

            {createdRecovery ? (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("auth.anon.recoveryTitle")}
                </p>
                <p className="mt-2 rounded-2xl bg-muted px-4 py-3 text-center font-mono text-xl font-semibold tracking-[0.15em] text-foreground">
                  {createdRecovery}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-amber-600">
                  {t("auth.anon.recoveryWarning")}
                </p>
                <button
                  type="button"
                  onClick={confirmAnonRecovery}
                  className="mt-3 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {t("auth.anon.recoveryConfirm")}
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
                  {(["login", "create"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setAnonMode(item)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        anonMode === item
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t(item === "login" ? "account.anon.tabLogin" : "account.anon.tabCreate")}
                    </button>
                  ))}
                </div>

                {anonMode === "login" ? (
                  <form onSubmit={recoverAnon} className="mt-5 flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                      {t("account.anon.loginDesc")}
                    </p>
                    <input
                      type="text"
                      required
                      value={anonRecoveryInput}
                      onChange={(e) => setAnonRecoveryInput(e.target.value)}
                      placeholder={t("auth.anon.recoverPlaceholder")}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-center font-mono text-sm tracking-widest text-foreground outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      {t("auth.anon.recoverButton")}
                    </button>
                  </form>
                ) : (
                  <div className="mt-5">
                    <p className="text-sm text-muted-foreground">
                      {t("account.anon.createDesc")}
                    </p>
                    <Turnstile onVerify={setCaptchaToken} />
                    <button
                      type="button"
                      onClick={startGuest}
                      disabled={busy || (TURNSTILE_ENABLED && !captchaToken)}
                      className="mt-3 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      {busy ? t("auth.anon.creating") : t("auth.anon.button")}
                    </button>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {t("auth.anon.note")}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

type DeviceItem = {
  id: string;
  name: string;
  platform: string;
  status: string;
  last_seen_at: string | null;
};

function DeviceManager({
  identity,
  devices,
  deviceLimit,
  onChanged,
}: {
  identity: "account" | "guest" | "none";
  devices: DeviceItem[];
  deviceLimit?: number;
  onChanged: () => Promise<void>;
}) {
  const t = useT();
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canPair = identity !== "none";

  async function generate() {
    setBusy(true);
    try {
      if (identity === "account") {
        const result = await createAccountPairingCode();
        setCode(result.code);
      } else {
        const token = readGuestToken();
        if (!token) {
          toast.error(t("devices.needIdentity"));
          return;
        }
        const result = await createPairingCode({ data: { guestToken: token } });
        setCode(result.code);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function unpair(id: string) {
    setBusy(true);
    try {
      if (identity === "account") {
        await removeDevice({ data: { id } });
      } else {
        const token = readGuestToken();
        if (!token) return;
        await removeGuestDevice({ data: { token, id } });
      }
      toast.success(t("devices.removed"));
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-card-foreground">
        {t("account.action.manageDevices")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("devices.subtitle")}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          {canPair ? (
            <>
              {code ? (
                <p className="font-mono text-3xl font-semibold tracking-[0.2em] text-primary">
                  {code}
                </p>
              ) : (
                <p className="font-mono text-3xl font-semibold tracking-[0.2em] text-muted-foreground/40">
                  ····-····
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{t("devices.codeHint")}</p>
              <button
                onClick={generate}
                disabled={busy}
                className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {code ? t("devices.regenerate") : t("devices.generate")}
              </button>
              {identity === "guest" && deviceLimit !== undefined && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("devices.guestLimit", { n: deviceLimit })}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("devices.needIdentity")}</p>
          )}

          <ol className="mt-6 flex flex-col gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
            <li className="font-semibold text-card-foreground">{t("devices.steps")}</li>
            <li>1. {t("devices.step1")}</li>
            <li>2. {t("devices.step2")}</li>
            <li>3. {t("devices.step3")}</li>
          </ol>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-card-foreground">{t("devices.list")}</h3>
          {devices.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
              {t("devices.empty")}
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {devices.map((device) => (
                <li
                  key={device.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Laptop size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{device.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {device.platform} ·{" "}
                        {t(`devices.status.${device.status === "online" ? "online" : device.status === "idle" ? "idle" : "offline"}`)}
                        {device.last_seen_at
                          ? ` · ${t("devices.lastSeen")} ${new Date(device.last_seen_at).toLocaleString()}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => unpair(device.id)}
                    disabled={busy}
                    className="rounded-full border border-input px-4 py-2 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-60"
                  >
                    {t("devices.remove")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

type SharedResource = {
  id: string;
  kind: "vps" | "residential";
  title: string;
  status: string;
  detail?: string;
};

function ResourceColumn({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: SharedResource[];
}) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        <p className="text-sm font-semibold text-card-foreground">{title}</p>
        <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
          {t("account.resources.none")}
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3"
            >
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  r.status === "active"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/15 text-amber-600"
                }`}
              >
                {r.status}
              </span>
              <span className="text-sm text-card-foreground">{r.title}</span>
              {r.detail && (
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  {r.detail}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SharedResources() {
  const t = useT();
  // TODO(poolvip): pull purchased shared-VPS / residential-IP resources from
  // poolvip.airlane.cloud once resource tables are wired to identity_id.
  const resources: SharedResource[] = [];
  const vps = resources.filter((r) => r.kind === "vps");
  const residential = resources.filter((r) => r.kind === "residential");
  return (
    <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-lg font-semibold text-card-foreground">
          {t("account.resources.title")}
        </h2>
        <a
          href="https://poolvip.airlane.cloud"
          target="_blank"
          rel="noreferrer"
          className="ml-auto rounded-full border border-input px-4 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
        >
          {t("account.resources.browse")}
        </a>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ResourceColumn
          icon={<Server size={14} />}
          title={t("account.resources.type.vps")}
          items={vps}
        />
        <ResourceColumn
          icon={<Globe size={14} />}
          title={t("account.resources.type.residential")}
          items={residential}
        />
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-card-foreground">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function List({ title, items, tone }: { title: string; items: string[]; tone: "ok" | "no" }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-muted-foreground">
            <span className={tone === "ok" ? "text-emerald-600" : "text-rose-500"}>
              {tone === "ok" ? <Check size={16} /> : <X size={16} />}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
