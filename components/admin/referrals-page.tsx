"use client";
import Notice from "./notice";
import Link from "next/link";
import { api, apiMessage, queryPath } from "@/lib/api";
import { useConfirm } from "@/providers/confirm-provider";
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Briefcase,
  Building2,
  CheckCircle,
  MapPin,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import {
  Badge,
  Drawer,
  Empty,
  PageHeader,
  Panel,
  Segmented,
  ago,
  when,
  useDebounced,
} from "./ui";
import { InfiniteFooter, useInfiniteList } from "./use-infinite-list";

type Referral = {
  id: string;
  title: string;
  location: string;
  workMode: string;
  level: string | null;
  skills: string;
  status: "open" | "closed";
  createdAt: string;
  closedAt: string | null;
  company: string;
  companyLink: string | null;
  jobLink: string | null;
  ownerName: string;
  ownerEmail: string;
  requests: number;
  accepted: number;
};

const LIMIT = 20;

export default function ReferralsPage() {
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "open" | "closed">("all");
  const [selected, setSelected] = useState<Referral | null>(null);
  const q = useDebounced(search);

  const feed = useInfiniteList<Referral>(
    "/admin/referrals",
    { search: q, status },
    LIMIT,
  );
  const {
    data,
    setData,
    error: message,
    setError: setMessage,
    reload: load,
  } = feed;

  async function toggleStatus(ref: Referral) {
    const next = ref.status === "open" ? "closed" : "open";
    if (
      !(await confirm({
        title: `${next === "closed" ? "Close" : "Reopen"} this referral?`,
        message: `${next === "closed" ? "No new requests will be accepted." : "This referral will accept new requests again."}`,
        confirmLabel: next === "closed" ? "Close referral" : "Reopen referral",
        tone: next === "closed" ? "danger" : "default",
      }))
    )
      return;
    try {
      await api(`/admin/referrals/${ref.id}`, {
        method: "PATCH",
        body: { status: next },
      });
      setSelected(null);
      void load();
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Referrals"
        description="Browse all job referral listings, monitor requests and close any that violate policies."
        actions={
          <Link href="/admin/referrals/new" className="ac-btn primary">
            <Plus size={15} /> New referral
          </Link>
        }
      />
      <Notice message={message} onClose={() => setMessage("")} />

      <div className="ac-kpis" style={{ marginBottom: 20 }}>
        <div className="ac-kpi">
          <div className="ac-kpi-top">
            <span
              className="ac-kpi-icon"
              style={{
                color: "#3159df",
                background: "color-mix(in srgb, #3159df 14%, transparent)",
              }}
            >
              <Briefcase size={18} />
            </span>
          </div>
          <strong>{data.total.toLocaleString()}</strong>
          <span className="ac-kpi-label">Total referrals</span>
          <span className="ac-trend flat">&nbsp;</span>
        </div>
        <div className="ac-kpi">
          <div className="ac-kpi-top">
            <span
              className="ac-kpi-icon"
              style={{
                color: "#16a34a",
                background: "color-mix(in srgb, #16a34a 14%, transparent)",
              }}
            >
              <CheckCircle size={18} />
            </span>
          </div>
          <strong>
            {data.items.filter((r) => r.status === "open").length}
          </strong>
          <span className="ac-kpi-label">Open (this page)</span>
          <span className="ac-trend flat">&nbsp;</span>
        </div>
        <div className="ac-kpi">
          <div className="ac-kpi-top">
            <span
              className="ac-kpi-icon"
              style={{
                color: "#7c3aed",
                background: "color-mix(in srgb, #7c3aed 14%, transparent)",
              }}
            >
              <Users size={18} />
            </span>
          </div>
          <strong>{data.items.reduce((s, r) => s + r.requests, 0)}</strong>
          <span className="ac-kpi-label">Total requests (this page)</span>
          <span className="ac-trend flat">&nbsp;</span>
        </div>
      </div>

      <Panel flush>
        <div className="ac-toolbar">
          <label className="ac-search" style={{ flex: 1 }}>
            <Search size={16} />
            <input
              placeholder="Search job title, company or owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <Segmented
            value={status}
            onChange={(v) => setStatus(v)}
            options={[
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
            ]}
          />
        </div>

        <table className="ac-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Posted by</th>
              <th>Requests</th>
              <th>Status</th>
              <th>Age</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((r) => (
              <tr
                key={r.id}
                className="ac-row-click"
                onClick={() => setSelected(r)}
              >
                <td>
                  <div className="ac-cell-primary">{r.title}</div>
                  <div className="ac-cell-sub">
                    <MapPin size={11} /> {r.location} · {r.workMode}
                    {r.level && ` · ${r.level}`}
                  </div>
                </td>
                <td>
                  <div className="ac-cell-primary">
                    <Building2 size={12} /> {r.company}
                  </div>
                </td>
                <td>
                  <div className="ac-cell-primary">{r.ownerName}</div>
                  <div className="ac-cell-sub">{r.ownerEmail}</div>
                </td>
                <td>
                  <span>{r.requests} total</span>
                  {r.accepted > 0 && (
                    <div className="ac-cell-sub">{r.accepted} accepted</div>
                  )}
                </td>
                <td>
                  <Badge value={r.status} />
                </td>
                <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                  {ago(r.createdAt)}
                </td>
                <td>
                  <button
                    className={`ac-btn sm ${r.status === "open" ? "danger" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleStatus(r);
                    }}
                  >
                    {r.status === "open" ? (
                      <XCircle size={13} />
                    ) : (
                      <CheckCircle size={13} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!data.items.length && (
          <Empty
            title="No referrals found"
            hint="Try adjusting your filters."
          />
        )}
        <InfiniteFooter feed={feed} />
      </Panel>

      {selected && (
        <Drawer title="Referral detail" onClose={() => setSelected(null)}>
          <div className="ac-detail-section">
            <h3>Role</h3>
            <div className="ac-facts">
              <div>
                <dt>
                  <Briefcase size={13} /> Title
                </dt>
                <dd>{selected.title}</dd>
              </div>
              <div>
                <dt>
                  <Building2 size={13} /> Company
                </dt>
                <dd>{selected.company}</dd>
              </div>
              <div>
                <dt>
                  <MapPin size={13} /> Location
                </dt>
                <dd>{selected.location}</dd>
              </div>
              <div>
                <dt>Mode</dt>
                <dd>{selected.workMode}</dd>
              </div>
              {selected.level && (
                <div>
                  <dt>Level</dt>
                  <dd>{selected.level}</dd>
                </div>
              )}
              <div>
                <dt>Skills</dt>
                <dd>{selected.skills}</dd>
              </div>
              {selected.companyLink && (
                <div>
                  <dt>Company link</dt>
                  <dd>
                    <a
                      className="ac-link"
                      href={selected.companyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selected.companyLink}
                    </a>
                  </dd>
                </div>
              )}
              {selected.jobLink && (
                <div>
                  <dt>Job description</dt>
                  <dd>
                    <a
                      className="ac-link"
                      href={selected.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selected.jobLink}
                    </a>
                  </dd>
                </div>
              )}
            </div>
          </div>
          <div className="ac-detail-section">
            <h3>Owner</h3>
            <div className="ac-facts">
              <div>
                <dt>Name</dt>
                <dd>{selected.ownerName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{selected.ownerEmail}</dd>
              </div>
            </div>
          </div>
          <div className="ac-detail-section">
            <h3>Activity</h3>
            <div className="ac-facts">
              <div>
                <dt>
                  <Users size={13} /> Requests
                </dt>
                <dd>{selected.requests}</dd>
              </div>
              <div>
                <dt>Accepted</dt>
                <dd>{selected.accepted}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <Badge value={selected.status} />
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{when(selected.createdAt)}</dd>
              </div>
              {selected.closedAt && (
                <div>
                  <dt>Closed</dt>
                  <dd>{when(selected.closedAt)}</dd>
                </div>
              )}
            </div>
          </div>
          <div className="ac-drawer-actions">
            <button
              className={`ac-btn ${selected.status === "open" ? "danger" : ""}`}
              onClick={() => void toggleStatus(selected)}
            >
              {selected.status === "open" ? (
                <>
                  <XCircle size={15} /> Close referral
                </>
              ) : (
                <>
                  <CheckCircle size={15} /> Reopen referral
                </>
              )}
            </button>
          </div>
        </Drawer>
      )}
    </>
  );
}
