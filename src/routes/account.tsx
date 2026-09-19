import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, X, Cloud, ShieldCheck, User, Server, Globe } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/turnstile";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/i18n";
import { clearGuestToken, readGuestToken, writeGuestToken } from "@/lib/guest";
import {
  createGuestSession,
  endGuestSession,
  getAccountOverview,
  getGuestSession,
  upgradeGuestSession,
} from "@/lib/account.functions";
import { rotateRecoveryCode } from "@/lib/identity.functions";

export const Route = createFileRoute("/account")({
  ssr: false,
  head: () => ({
    meta: [
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
      toast.success(t("account.guest.created"));
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
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
            <Link
              to="/devices"
              className="rounded-full border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              {t("account.action.manageDevices")}
            </Link>
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
              <Stat label={t("account.usage.snapshots")} value={overview?.counts.snapshots ?? 0} />
              <Stat label={t("account.usage.devices")} value={overview?.devices.length ?? 0} />
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
              <Turnstile onVerify={setCaptchaToken} />
              <button
                onClick={startGuest}
                disabled={busy || (TURNSTILE_ENABLED && !captchaToken)}
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

        <SharedResources />

        <p className="rounded-2xl border border-border bg-muted/60 p-4 text-sm text-foreground">
          {t("account.rule")}
        </p>
      </div>
    </main>
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
