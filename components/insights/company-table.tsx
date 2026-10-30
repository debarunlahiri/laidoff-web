"use client";
import { workforceCompanies } from "@/data/workforce";
import { usePlatform } from "@/providers/platform-provider";

export default function CompanyTable() {
  const { year } = usePlatform();

  return (
    <section className="card company-table">
      <h2>Company overview</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Roles affected</th>
              <th>Headcount</th>
              <th>Hires</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {workforceCompanies.map((company) => (
              <tr key={company.name}>
                <td>{company.name}</td>
                <td>{company.rolesAffected}</td>
                <td>{company.headcount}</td>
                <td>{company.hires}</td>
                <td>
                  <span className="tag">Illustrative</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="subtle-text">
        Source: fictional demo dataset · Period: {year} · Updated: October 29,
        2026. Hires are independently listed, never inferred from workforce
        changes. Coverage is limited to these three fictional companies.
      </p>
    </section>
  );
}
