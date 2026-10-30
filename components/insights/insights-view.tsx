"use client";
import CompanyTable from "@/components/insights/company-table";
import WorkforceChart from "@/components/insights/workforce-chart";
import { usePlatform } from "@/providers/platform-provider";
import { ShieldCheck } from "lucide-react";
export default function InsightsView() {
  const { year, setYear, insights, insightsLoading, insightsError } =
    usePlatform();
  const current = new Date().getFullYear();
  return (
    <>
      <div className="section-bar">
        <h2>Workforce at a glance</h2>
        <select
          aria-label="Reporting year"
          value={year}
          onChange={(event) => setYear(event.target.value)}
        >
          {Array.from(
            { length: Math.max(3, current - 2023) },
            (_, i) => current - i,
          ).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="insight-disclaimer">
        <ShieldCheck size={20} />
        <span>{insights.notice}</span>
      </div>
      {insightsLoading && <p role="status">Loading workforce reports…</p>}
      {insightsError && <p role="alert">{insightsError}</p>}
      <div className="network-stats">
        <div className="card">
          <strong>
            {insights.companies
              .reduce((sum, item) => sum + Number(item.rolesAffected), 0)
              .toLocaleString()}
          </strong>
          <span>Reported roles affected</span>
        </div>
        <div className="card">
          <strong>{insights.companies.length}</strong>
          <span>Companies reported</span>
        </div>
        <div className="card">
          <strong>
            {insights.monthly.reduce(
              (sum, item) => sum + Number(item.reports),
              0,
            )}
          </strong>
          <span>Submitted reports</span>
        </div>
      </div>
      <WorkforceChart />
      <CompanyTable />
    </>
  );
}
