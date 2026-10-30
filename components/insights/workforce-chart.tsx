"use client";
import { monthlyWorkforceTrend } from "@/data/workforce";
import { usePlatform } from "@/providers/platform-provider";

export default function WorkforceChart() {
  const { year } = usePlatform();

  return (
    <section className="card chart-card">
      <div className="section-bar">
        <div>
          <h2>Every number is a human story.</h2>
          <p>Illustrative monthly roles affected · {year}</p>
        </div>
        <span className="tag">Sample dataset</span>
      </div>
      <div className="bar-chart">
        {monthlyWorkforceTrend.map(({ month, value }) => (
          <div key={month}>
            <span
              style={{
                height: `${Math.max(12, value - (2026 - Number(year)) * 10)}%`,
              }}
            />
            <small>{month.slice(0, 1)}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
