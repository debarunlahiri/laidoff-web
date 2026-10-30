"use client";
import { usePlatform } from "@/providers/platform-provider";
export default function WorkforceChart() {
  const { year, insights } = usePlatform();
  const maximum = Math.max(
    1,
    ...insights.monthly.map((item) => Number(item.rolesAffected)),
  );
  return (
    <section className="card chart-card">
      <div className="section-bar">
        <div>
          <h2>Every number is a human story.</h2>
          <p>Reported monthly roles affected · {year}</p>
        </div>
        <span className="tag">User reported</span>
      </div>
      <div className="bar-chart">
        {Array.from({ length: 12 }, (_, index) => {
          const month = new Intl.DateTimeFormat(undefined, {
            month: "short",
          }).format(new Date(2000, index, 1));
          const value = Number(
            insights.monthly.find((item) => Number(item.month) === index + 1)
              ?.rolesAffected ?? 0,
          );
          return (
            <div
              key={index}
              title={`${month}: ${value.toLocaleString()} reported roles`}
            >
              <span style={{ height: `${(value / maximum) * 100}%` }} />
              <small>{month}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
