"use client";
import { yearlyReportedRoles } from "@/data/workforce";
import CompanyTable from "@/components/insights/company-table";
import WorkforceChart from "@/components/insights/workforce-chart";
import { usePlatform } from "@/providers/platform-provider";
import { ShieldCheck } from "lucide-react";

export default function InsightsView() {
  const { year, setYear } = usePlatform();

  return (
    <>
      <div className="section-bar">
        <h2>Workforce at a glance</h2>
        <select
          aria-label="Reporting year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option>2026</option>
          <option>2025</option>
          <option>2024</option>
        </select>
      </div>
      <div className="insight-disclaimer">
        <ShieldCheck size={20} />
        <span>
          Illustrative data only. These fictional companies and figures
          demonstrate the dashboard, and do not represent actual employment
          trends.
        </span>
      </div>
      <div className="network-stats">
        <div className="card">
          <strong>{yearlyReportedRoles[year]}</strong>
          <span>Reported roles affected</span>
        </div>
        <div className="card">
          <strong>3</strong>
          <span>Companies tracked</span>
        </div>
        <div className="card">
          <strong>6</strong>
          <span>Illustrative events</span>
        </div>
      </div>
      <WorkforceChart />
      <CompanyTable />
    </>
  );
}
