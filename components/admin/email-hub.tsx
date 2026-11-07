"use client";
import { useState } from "react";
import { PageHeader, Segmented } from "./ui";
import TemplatesPanel from "./templates-panel";
import SettingsPanel from "./settings-panel";
import LogsPanel from "./logs-panel";

export default function EmailHub() {
  const [tab, setTab] = useState<"templates" | "settings" | "logs">(
    "templates",
  );
  return (
    <>
      <PageHeader
        title="Email"
        description="Templates, sender settings and delivery history for every email the platform sends."
        actions={
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: "templates", label: "Templates" },
              { value: "settings", label: "Settings" },
              { value: "logs", label: "Delivery log" },
            ]}
          />
        }
      />
      {tab === "templates" && <TemplatesPanel />}
      {tab === "settings" && <SettingsPanel />}
      {tab === "logs" && <LogsPanel />}
    </>
  );
}
