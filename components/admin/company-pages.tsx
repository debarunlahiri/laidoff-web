"use client";
import { api, apiMessage } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Briefcase, Building2, Globe, MapPin, Plus, Search } from "lucide-react";
import { Badge, Empty, PageHeader, Panel, Segmented, ago, useDebounced } from "./ui";
import { Check2, FormPage, Input, Row, Section, TextArea } from "./forms";
import { Dropdown } from "./dropdown";
import { InfiniteFooter, useInfiniteList } from "./use-infinite-list";

type Company = {
  id: string; name: string; industry: string | null; headquarters: string | null; website: string | null;
  active: boolean; createdAt: string; createdByName: string | null;
  posts: number; referrals: number; layoffReports: number;
};

export function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const q = useDebounced(search);
  const feed = useInfiniteList<Company>("/admin/companies", { search: q, status }, 25);
  const { data, error } = feed;
  return (
    <>
      <PageHeader
        title="Companies"
        description="Every company members can attach to posts, referrals and layoff reports. Members can add missing ones themselves."
        actions={<Link href="/admin/companies/new" className="ac-btn primary"><Plus size={15} /> New company</Link>}
      />
      {error && <p className="adm-error">{error}</p>}
      <Panel flush>
        <div className="ac-toolbar ac-toolbar-wrap">
          <label className="ac-search">
            <Search size={16} />
            <input placeholder="Search by name or industry…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <Segmented
            value={status}
            onChange={setStatus}
            options={[{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "hidden", label: "Hidden" }]}
          />
        </div>
        <div className="ac-scroll">
          <table className="ac-table">
            <thead>
              <tr><th>Company</th><th>Industry</th><th>Location</th><th style={{ textAlign: "right" }}>Usage</th><th>Added</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c.id} className="ac-row-click">
                  <td>
                    <Link href={`/admin/companies/${c.id}`} className="ac-rowlink">
                      <span className="ac-companymark"><Building2 size={15} /></span>
                      <span>
                        <span className="ac-cell-primary">{c.name}</span>
                        {c.website && <span className="ac-cell-sub"><Globe size={11} /> {c.website.replace(/^https?:\/\//, "")}</span>}
                      </span>
                    </Link>
                  </td>
                  <td>{c.industry || <span className="ac-muted">—</span>}</td>
                  <td>{c.headquarters ? <><MapPin size={11} /> {c.headquarters}</> : <span className="ac-muted">—</span>}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <span className="ac-inline-stats"><Briefcase size={12} /> {c.referrals} · {c.posts} posts · {c.layoffReports} layoffs</span>
                  </td>
                  <td style={{ whiteSpace: "nowrap", color: "var(--muted)" }}>
                    {ago(c.createdAt)}{c.createdByName && <div className="ac-cell-sub">by {c.createdByName}</div>}
                  </td>
                  <td><Badge value={c.active ? "active" : "muted"} label={c.active ? "Active" : "Hidden"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.items.length && !feed.loading && <Empty title="No companies found" hint="Try another search, or create one." />}
        <InfiniteFooter feed={feed} />
      </Panel>
    </>
  );
}

type Form = { name: string; description: string; website: string; industry: string; headquarters: string; active: boolean };

export function CompanyForm() {
  const params = useParams<{ id?: string }>();
  const id = params?.id && params.id !== "new" ? params.id : undefined;
  const [f, setF] = useState<Form>({ name: "", description: "", website: "", industry: "", headquarters: "", active: true });
  const [ready, setReady] = useState(!id);
  const [error, setError] = useState("");
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!id) return;
    api<Form>(`/admin/companies/${id}`).then((r) => { setF(r); setReady(true); }, (e) => setError(apiMessage(e)));
  }, [id]);

  if (error) return <p className="adm-error">{error}</p>;
  if (!ready) return <p className="ac-muted">Loading…</p>;
  return (
    <FormPage
      title={id ? `Edit ${f.name || "company"}` : "New company"}
      description="Companies can be attached to posts, referrals and layoff reports."
      backHref="/admin/companies" backLabel="All companies" submitLabel={id ? "Save changes" : "Create company"}
      onSubmit={async () => { await api(id ? `/admin/companies/${id}` : "/admin/companies", { method: id ? "PUT" : "POST", body: f }); }}
    >
      <Section title="Company">
        <Input label="Name" required maxLength={160} value={f.name} onChange={(e) => set("name", e.target.value)} />
        <Row>
          <Input label="Industry" maxLength={160} value={f.industry} onChange={(e) => set("industry", e.target.value)} />
          <Input label="Headquarters" maxLength={160} value={f.headquarters} onChange={(e) => set("headquarters", e.target.value)} />
        </Row>
        <Input label="Website" type="url" placeholder="https://…" value={f.website} onChange={(e) => set("website", e.target.value)} />
        <TextArea label="Description" maxLength={5000} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </Section>
      <Section title="Visibility">
        <Check2 label="Active" hint="Hidden companies disappear from member pickers; existing posts and referrals keep them." checked={f.active} onChange={(v) => set("active", v)} />
      </Section>
    </FormPage>
  );
}
