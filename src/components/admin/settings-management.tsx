"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Field, InlineNotice } from "@/components/shared/form-controls";
import { adminService } from "@/lib/services/admin-service";
import { SystemSetting } from "@/types/admin";

export function SettingsManagement() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [reason, setReason] = useState("Configuration update");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    adminService.getSettings().then(setSettings);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="System settings"
        description="Control global platform settings with explicit audit reasons for each change."
      />
      {feedback ? <InlineNotice tone="success">{feedback}</InlineNotice> : null}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminPanel className="p-6">
          <div className="grid gap-4">
            {settings.map((setting) => (
              <div key={setting.key} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <div className="min-w-0 flex-1">
                    <Field
                      label={setting.label}
                      name={setting.key}
                      type={setting.type === "email" ? "email" : "text"}
                      value={setting.value}
                      onChange={(event) =>
                        setSettings((current) =>
                          current.map((item) =>
                            item.key === setting.key ? { ...item, value: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const updated = settings.find((item) => item.key === setting.key);
                        if (!updated) {
                          return;
                        }
                        const next = await adminService.updateSetting(updated.key, updated.value, reason);
                        setSettings(next);
                        setFeedback(`${updated.label} updated.`);
                      })
                    }
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
        <AdminPanel className="p-6">
          <Field
            label="Audit reason"
            name="reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            helperText="This is recorded on every setting mutation."
          />
          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
            Settings should remain low-frequency, high-confidence changes. In production, these would typically be backed by stricter permission checks and environment-specific validation.
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
