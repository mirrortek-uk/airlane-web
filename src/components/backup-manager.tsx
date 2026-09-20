import { useCallback, useEffect, useState } from "react";
import { Archive, Eye, EyeOff, Trash2, XIcon } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/i18n";
import { decryptBackup, maskSecrets } from "@/lib/cloud-backup";

type SnapshotRow = { id: string; name: string; created_at: string };

export function BackupManager({ userId }: { userId: string }) {
  const t = useT();
  const [rows, setRows] = useState<SnapshotRow[] | null>(null);
  const [open, setOpen] = useState<SnapshotRow | null>(null);
  const [bundle, setBundle] = useState<unknown>(null);
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("cloud_snapshots")
      .select("id,name,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setRows(data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function view(row: SnapshotRow) {
    setOpen(row);
    setBundle(null);
    setReveal(false);
    const { data, error } = await supabase
      .from("cloud_snapshots")
      .select("ciphertext")
      .eq("id", row.id)
      .single();
    if (error || !data) {
      toast.error(t("account.backups.decryptFailed"));
      setOpen(null);
      return;
    }
    try {
      setBundle(await decryptBackup(userId, data.ciphertext));
    } catch {
      toast.error(t("account.backups.decryptFailed"));
      setOpen(null);
    }
  }

  async function remove(row: SnapshotRow) {
    if (!window.confirm(t("account.backups.deleteConfirm", { name: row.name }))) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("cloud_snapshots").delete().eq("id", row.id);
      if (error) throw error;
      toast.success(t("account.backups.deleted"));
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  if (rows === null || rows.length === 0) {
    return rows === null ? null : (
      <section className="rounded-3xl border border-border bg-card p-8 shadow-lg">
        <h2 className="font-display text-xl font-semibold text-card-foreground">
          {t("account.backups.title")}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">{t("account.backups.empty")}</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-8 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Archive size={18} />
        </span>
        <h2 className="font-display text-xl font-semibold text-card-foreground">
          {t("account.backups.title")}
        </h2>
      </div>

      <ul className="mt-5 divide-y divide-border rounded-2xl border border-border">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(row.created_at).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => view(row)}
              className="rounded-full border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
            >
              {t("account.backups.view")}
            </button>
            <button
              type="button"
              onClick={() => remove(row)}
              disabled={busy}
              aria-label={t("account.backups.delete")}
              className="rounded-full border border-input p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive disabled:opacity-60"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label={t("account.backups.close")}
              onClick={() => setOpen(null)}
              className="absolute right-5 top-5 text-muted-foreground hover:text-foreground"
            >
              <XIcon size={18} />
            </button>
            <h3 className="font-display text-lg font-semibold text-card-foreground">
              {open.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(open.created_at).toLocaleString()}
            </p>
            <div className="mt-4 min-h-0 flex-1 overflow-auto rounded-2xl bg-muted p-4">
              {bundle === null ? (
                <p className="text-sm text-muted-foreground">{t("account.backups.loading")}</p>
              ) : (
                <pre className="whitespace-pre-wrap break-all font-mono text-xs text-foreground">
                  {JSON.stringify(reveal ? bundle : maskSecrets(bundle), null, 2)}
                </pre>
              )}
            </div>
            {bundle !== null && (
              <button
                type="button"
                onClick={() => setReveal((v) => !v)}
                className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-input px-4 py-2 text-xs font-medium text-foreground hover:bg-accent"
              >
                {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
                {t(reveal ? "account.backups.hide" : "account.backups.reveal")}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
