import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Cloud, CloudOff, ShieldCheck, User } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
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
      const session = await createGuestSession();
      writeGuestToken(session.token);
      toast.success(t("account.guest.created"));
      await refresh();
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
          <Link to="/" className="font-display text-lg font-semibold text-foreground">
            AirLane
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
          <p className="mt-2 text-sm text-muted-foreground">{t("account.subtitle")}</p>
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

            <p className="mt-4 font-mono text-xs text-muted-foreground">
              {t("account.guest.idLabel")}: {guest.id}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t("account.guest.expires")}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat
                label={t("account.usage.snapshots")}
                value={`${guest.usage.snapshots} / ${guest.limits.snapshots}`}
              />
              <Stat
                label={t("account.usage.devices")}
                value={`${guest.usage.devices} / ${guest.limits.devices}`}
              />
              <Stat
                label={t("account.usage.favorites")}
                value={`${guest.usage.favorites} / ${guest.limits.favorites}`}
              />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <List
                title={t("account.guest.allowed")}
                tone="ok"
                items={[
                  t("account.guest.allow1", { n: guest.limits.snapshots }),
                  t("account.guest.allow2", { n: guest.limits.devices }),
                  t("account.guest.allow3"),
                  t("account.guest.allow4", { n: guest.limits.favorites }),
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
                onClick={exitGuest}
                disabled={busy}
                className="rounded-full border border-input px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-60"
              >
                {t("account.action.exitGuest")}
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-border bg-card p-8 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CloudOff size={18} />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-card-foreground">
                  {t("account.state.local")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("account.state.localDesc")}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={startGuest}
                disabled={busy}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {t("account.action.tryGuest")}
              </button>
              <Link
                to="/auth"
                className="rounded-full border border-input px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
              >
                {t("account.action.signIn")}
              </Link>
            </div>
          </section>
        )}

        <IdentityMatrix />

        <p className="rounded-2xl border border-border bg-muted/60 p-4 text-sm text-foreground">
          {t("account.rule")}
        </p>
      </div>
    </main>
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

function IdentityMatrix() {
  const t = useT();
  const rows: Array<[string, string, string, string, string]> = [
    [
      t("account.matrix.row.api"),
      t("account.matrix.none"),
      t("account.matrix.session"),
      t("account.matrix.full"),
      t("account.matrix.scoped"),
    ],
    [
      t("account.matrix.row.localCaps"),
      t("account.matrix.yes"),
      t("account.matrix.yes"),
      t("account.matrix.yes"),
      t("account.matrix.yes"),
    ],
    [
      t("account.matrix.row.cloud"),
      t("account.matrix.no"),
      t("account.matrix.limited"),
      t("account.matrix.yes"),
      t("account.matrix.scoped"),
    ],
    [
      t("account.matrix.row.console"),
      t("account.matrix.no"),
      t("account.matrix.no"),
      t("account.matrix.yes"),
      t("account.matrix.yes"),
    ],
    [
      t("account.matrix.row.register"),
      t("account.matrix.notNeeded"),
      t("account.matrix.autoId"),
      t("account.matrix.needed"),
      t("account.matrix.invited"),
    ],
    [
      t("account.matrix.row.switch"),
      t("account.matrix.stayLocal"),
      t("account.matrix.lost"),
      t("account.matrix.synced"),
      t("account.matrix.synced"),
    ],
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <h2 className="border-b border-border px-6 py-4 font-display text-lg font-semibold text-card-foreground">
        {t("account.matrix.title")}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">{t("account.matrix.col.item")}</th>
              <th className="px-6 py-3 font-medium">{t("account.matrix.col.local")}</th>
              <th className="px-6 py-3 font-medium">{t("account.matrix.col.guest")}</th>
              <th className="px-6 py-3 font-medium">{t("account.matrix.col.owner")}</th>
              <th className="px-6 py-3 font-medium">{t("account.matrix.col.member")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-t border-border">
                <td className="px-6 py-3 font-medium text-card-foreground">{row[0]}</td>
                <td className="px-6 py-3 text-muted-foreground">{row[1]}</td>
                <td className="px-6 py-3 text-muted-foreground">{row[2]}</td>
                <td className="px-6 py-3 text-muted-foreground">{row[3]}</td>
                <td className="px-6 py-3 text-muted-foreground">{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
