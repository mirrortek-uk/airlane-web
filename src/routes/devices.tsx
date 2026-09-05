import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Laptop } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/i18n";
import { readGuestToken, clearGuestToken } from "@/lib/guest";
import {
  createAccountPairingCode,
  createPairingCode,
  getAccountOverview,
  getGuestSession,
  removeDevice,
  removeGuestDevice,
} from "@/lib/account.functions";

export const Route = createFileRoute("/devices")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "客户端对接与设备管理 | AirLane" },
      {
        name: "description",
        content:
          "生成一次性配对码，将 AirLane 客户端绑定到云端身份，查看设备在线状态并随时解绑。",
      },
      { property: "og:title", content: "AirLane 客户端对接" },
      { property: "og:description", content: "配对码绑定客户端，实时查看设备在线状态。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DevicesPage,
});

type Device = {
  id: string;
  name: string;
  platform: string;
  status: string;
  last_seen_at: string | null;
};

function DevicesPage() {
  const t = useT();
  const [identity, setIdentity] = useState<"loading" | "none" | "guest" | "account">("loading");
  const [devices, setDevices] = useState<Device[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const overview = await getAccountOverview();
        setDevices(
          overview.devices.map((d) => ({
            id: d.id,
            name: d.name,
            platform: d.platform,
            status: d.status,
            last_seen_at: d.last_seen_at,
          })),
        );
        setIdentity("account");
        return;
      }
      const token = readGuestToken();
      if (!token) {
        setIdentity("none");
        setDevices([]);
        return;
      }
      const guest = await getGuestSession({ data: { token } });
      if (!guest.valid) {
        clearGuestToken();
        setIdentity("none");
        setDevices([]);
        return;
      }
      setDevices(guest.devices as Device[]);
      setIdentity("guest");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
      setIdentity("none");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  const canPair = identity === "account" || identity === "guest";

  return (
    <main className="relative min-h-screen bg-background px-4 py-12">
      <div className="relative mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="AirLane">
            <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/account"
              className="rounded-full border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              {t("account.title")}
            </Link>
          </div>
        </header>

        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {t("devices.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("devices.subtitle")}</p>
        </div>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-lg">
          {canPair ? (
            <>
              {code ? (
                <p className="font-mono text-4xl font-semibold tracking-[0.2em] text-primary">
                  {code}
                </p>
              ) : (
                <p className="font-mono text-4xl font-semibold tracking-[0.2em] text-muted-foreground/40">
                  ····-····
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">{t("devices.codeHint")}</p>
              <button
                onClick={generate}
                disabled={busy}
                className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {code ? t("devices.regenerate") : t("devices.generate")}
              </button>
              {identity === "guest" && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("devices.guestLimit", { n: 2 })}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{t("devices.needIdentity")}</p>
              <Link
                to="/account"
                className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t("account.title")}
              </Link>
            </>
          )}

          <ol className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
            <li className="font-semibold text-card-foreground">{t("devices.steps")}</li>
            <li>1. {t("devices.step1")}</li>
            <li>2. {t("devices.step2")}</li>
            <li>3. {t("devices.step3")}</li>
          </ol>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-card-foreground">
            {t("devices.list")}
          </h2>
          {devices.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("devices.empty")}</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
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
        </section>

        <section className="rounded-3xl border border-border bg-muted/50 p-8">
          <h2 className="font-display text-lg font-semibold text-foreground">{t("devices.api")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("devices.apiDesc")}</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-foreground/90 p-4 font-mono text-xs leading-relaxed text-background">
            {`POST /api/public/pair/claim
{ "code": "ABCD-2345", "name": "MacBook Pro", "platform": "macos", "client_version": "1.4.2" }

POST /api/public/pair/heartbeat
{ "device_id": "<uuid>", "status": "online" }`}
          </pre>
        </section>
      </div>
    </main>
  );
}
