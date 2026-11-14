"use client";
import LocationAutocomplete from "@/components/ui/location-autocomplete";
import { api } from "@/lib/api";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Check2,
  EntityPicker,
  FormPage,
  Input,
  type Option,
  Row,
  Section,
  Select,
  TextArea,
} from "./forms";

const TOPICS = [
  "General discussion",
  "Personal experience",
  "Offering referrals",
  "Career advice",
  "Layoff updates",
  "Hiring",
];
const num = (v: string) => (v.trim() === "" ? null : Number(v));

export function NewUserPage() {
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    headline: "",
    location: "",
    openToWork: false,
    isAdmin: false,
    badge: "",
    emailVerified: true,
    accountStatus: "active",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((s) => ({ ...s, [k]: v }));
  return (
    <FormPage
      title="Create user"
      description="Add a member account directly. They can sign in with the email and password you set."
      backHref="/admin/users"
      backLabel="All users"
      submitLabel="Create user"
      onSubmit={async () => {
        await api("/admin/users", {
          method: "POST",
          body: { ...f, badge: f.badge || null },
        });
      }}
    >
      <Section title="Account" description="Sign-in details for this member.">
        <Row>
          <Input
            label="Full name"
            required
            maxLength={100}
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            required
            value={f.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Row>
        <Input
          label="Password"
          type="text"
          required
          minLength={12}
          maxLength={128}
          autoComplete="off"
          value={f.password}
          hint="At least 12 characters; common or guessable passwords are rejected."
          onChange={(e) => set("password", e.target.value)}
        />
      </Section>
      <Section title="Profile">
        <Input
          label="Professional headline"
          maxLength={160}
          value={f.headline}
          onChange={(e) => set("headline", e.target.value)}
        />
        <LocationAutocomplete
          label="Location"
          value={f.location}
          onChange={(location) => set("location", location)}
        />
        <Check2
          label="Open to work"
          checked={f.openToWork}
          onChange={(v) => set("openToWork", v)}
        />
      </Section>
      <Section title="Access">
        <Select
          label="Account status"
          value={f.accountStatus}
          onChange={(e) => set("accountStatus", e.target.value)}
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deactivated">Deactivated</option>
        </Select>
        <Check2
          label="Email already verified"
          hint="Skips the verification email gate."
          checked={f.emailVerified}
          onChange={(v) => set("emailVerified", v)}
        />
        <Select
          label="Verified badge"
          value={f.badge}
          onChange={(e) => set("badge", e.target.value)}
        >
          <option value="">None</option>
          <option value="blue">Blue (member)</option>
          <option value="gold">Gold (company / official)</option>
        </Select>
        <Check2
          label="Administrator"
          hint="Grants full access to this admin console."
          checked={f.isAdmin}
          onChange={(v) => set("isAdmin", v)}
        />
      </Section>
    </FormPage>
  );
}

export function NewPostPage() {
  const [author, setAuthor] = useState<Option | null>(null);
  const [company, setCompany] = useState<Option | null>(null);
  const [text, setText] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [anonymous, setAnonymous] = useState(false);
  const [withPoll, setWithPoll] = useState(false);
  const [options, setOptions] = useState(["", ""]);
  const [multi, setMulti] = useState(false);
  const [hours, setHours] = useState("");
  return (
    <FormPage
      title="Create post"
      description="Publish a post on behalf of any member. Use #hashtags in the text to tag it."
      backHref="/admin/content"
      backLabel="All posts"
      submitLabel="Publish post"
      onSubmit={async () => {
        await api("/admin/posts", {
          method: "POST",
          body: {
            userId: author?.id,
            text,
            topic,
            anonymous,
            companyId: company?.id ?? null,
            poll: withPoll
              ? {
                  options: options.map((o) => o.trim()).filter(Boolean),
                  allowMultiple: multi,
                  durationHours: num(hours),
                }
              : null,
          },
        });
      }}
    >
      <Section title="Author">
        <EntityPicker
          label="Post as"
          kind="users"
          required
          value={author}
          onChange={setAuthor}
          createHref="/admin/users/new"
        />
        <Check2
          label="Show as anonymous"
          hint="Readers see “Anonymous member”; the author stays recorded for admins."
          checked={anonymous}
          onChange={setAnonymous}
        />
      </Section>
      <Section title="Content">
        <TextArea
          label="Post text"
          required
          maxLength={20000}
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          hint={`${text.length.toLocaleString()} / 20,000`}
        />
        <Row>
          <Select
            label="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <EntityPicker
            label="Company (optional)"
            kind="companies"
            value={company}
            onChange={setCompany}
            createHref="/admin/companies/new"
          />
        </Row>
      </Section>
      <Section
        title="Poll"
        description="Optional. Needs 2 to 6 distinct options."
      >
        <Check2
          label="Attach a poll"
          checked={withPoll}
          onChange={setWithPoll}
        />
        {withPoll && (
          <>
            {options.map((o, i) => (
              <div key={i} className="ac-optionrow">
                <input
                  className="ac-plain"
                  placeholder={`Option ${i + 1}`}
                  maxLength={100}
                  value={o}
                  onChange={(e) =>
                    setOptions((s) =>
                      s.map((x, j) => (j === i ? e.target.value : x)),
                    )
                  }
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="ac-btn sm"
                    aria-label="Remove option"
                    onClick={() =>
                      setOptions((s) => s.filter((_, j) => j !== i))
                    }
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button
                type="button"
                className="ac-btn sm"
                onClick={() => setOptions((s) => [...s, ""])}
              >
                <Plus size={13} /> Add option
              </button>
            )}
            <Row>
              <Input
                label="Closes after (hours)"
                type="number"
                min={1}
                max={720}
                placeholder="Never"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              <Check2
                label="Allow multiple answers"
                checked={multi}
                onChange={setMulti}
              />
            </Row>
          </>
        )}
      </Section>
    </FormPage>
  );
}

export function NewReferralPage() {
  const [owner, setOwner] = useState<Option | null>(null);
  const [company, setCompany] = useState<Option | null>(null);
  const [f, setF] = useState({
    title: "",
    location: "",
    workMode: "onsite",
    level: "",
    minExperience: "",
    skills: "",
    description: "",
    companyLink: "",
    jobLink: "",
  });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  return (
    <FormPage
      title="Create referral"
      description="Open a referral opportunity on behalf of a member."
      backHref="/admin/referrals"
      backLabel="All referrals"
      submitLabel="Create referral"
      onSubmit={async () => {
        await api("/admin/referrals", {
          method: "POST",
          body: {
            userId: owner?.id,
            companyId: company?.id,
            title: f.title,
            location: f.location,
            workMode: f.workMode,
            level: f.level || null,
            minExperience: num(f.minExperience),
            skills: f.skills,
            description: f.description,
            companyLink: f.companyLink,
            jobLink: f.jobLink,
          },
        });
      }}
    >
      <Section title="Who and where">
        <Row>
          <EntityPicker
            label="Referrer"
            kind="users"
            required
            value={owner}
            onChange={setOwner}
            createHref="/admin/users/new"
          />
          <EntityPicker
            label="Company"
            kind="companies"
            required
            value={company}
            onChange={setCompany}
            createHref="/admin/companies/new"
          />
        </Row>
      </Section>
      <Section title="Role">
        <Input
          label="Job title"
          required
          maxLength={120}
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <Row>
          <LocationAutocomplete
            label="Location"
            required
            value={f.location}
            onChange={(location) => set("location", location)}
          />
          <Select
            label="Work mode"
            value={f.workMode}
            onChange={(e) => set("workMode", e.target.value)}
          >
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </Select>
        </Row>
        <Row>
          <Select
            label="Experience level"
            value={f.level}
            onChange={(e) => set("level", e.target.value)}
          >
            <option value="">Not specified</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </Select>
          <Input
            label="Minimum years"
            type="number"
            min={0}
            max={60}
            value={f.minExperience}
            onChange={(e) => set("minExperience", e.target.value)}
          />
        </Row>
        <Input
          label="Required skills"
          required
          maxLength={200}
          hint="Any profession; comma separated, e.g. Teaching, Sales, Welding"
          value={f.skills}
          onChange={(e) => set("skills", e.target.value)}
        />
        <TextArea
          label="Description"
          maxLength={5000}
          value={f.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Section>
      <Section
        title="Links"
        description="Where candidates can read more. Both are optional."
      >
        <Input
          label="Company link"
          type="url"
          placeholder="https://company.com/careers"
          value={f.companyLink}
          onChange={(e) => set("companyLink", e.target.value)}
        />
        <Input
          label="Job description link"
          type="url"
          placeholder="https://company.com/jobs/123"
          value={f.jobLink}
          onChange={(e) => set("jobLink", e.target.value)}
        />
      </Section>
    </FormPage>
  );
}

export function NewWorkforcePage() {
  const [reporter, setReporter] = useState<Option | null>(null);
  const [company, setCompany] = useState<Option | null>(null);
  const [f, setF] = useState({
    eventDate: "",
    rolesAffected: "",
    headcount: "",
    hires: "",
    sourceUrl: "",
    status: "verified",
    summary: "",
  });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  return (
    <FormPage
      title="Add layoff report"
      description="Record a layoff or hiring event for a company, with its source."
      backHref="/admin/workforce"
      backLabel="All layoff reports"
      submitLabel="Add report"
      onSubmit={async () => {
        await api("/admin/workforce", {
          method: "POST",
          body: {
            userId: reporter?.id,
            companyId: company?.id,
            eventDate: f.eventDate,
            rolesAffected: num(f.rolesAffected),
            headcount: num(f.headcount),
            hires: num(f.hires),
            sourceUrl: f.sourceUrl,
            status: f.status,
            summary: f.summary,
          },
        });
      }}
    >
      <Section title="Company and reporter">
        <Row>
          <EntityPicker
            label="Company"
            kind="companies"
            required
            value={company}
            onChange={setCompany}
            createHref="/admin/companies/new"
          />
          <EntityPicker
            label="Reported by"
            kind="users"
            required
            value={reporter}
            onChange={setReporter}
            createHref="/admin/users/new"
          />
        </Row>
      </Section>
      <Section title="Event">
        <Row>
          <Input
            label="Event date"
            type="date"
            required
            value={f.eventDate}
            onChange={(e) => set("eventDate", e.target.value)}
          />
          <Input
            label="Roles affected"
            type="number"
            min={0}
            required
            value={f.rolesAffected}
            onChange={(e) => set("rolesAffected", e.target.value)}
          />
        </Row>
        <Row>
          <Input
            label="Total headcount"
            type="number"
            min={0}
            hint="Company size at the time (optional)"
            value={f.headcount}
            onChange={(e) => set("headcount", e.target.value)}
          />
          <Input
            label="Hires"
            type="number"
            min={0}
            hint="Optional"
            value={f.hires}
            onChange={(e) => set("hires", e.target.value)}
          />
        </Row>
        <Input
          label="Source URL"
          type="url"
          required
          placeholder="https://…"
          value={f.sourceUrl}
          onChange={(e) => set("sourceUrl", e.target.value)}
        />
      </Section>
      <Section title="Verification">
        <Select
          label="Status"
          value={f.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="verified">Verified</option>
          <option value="user_reported">User reported</option>
        </Select>
        <TextArea
          label="Verification summary"
          rows={3}
          maxLength={2000}
          value={f.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
      </Section>
    </FormPage>
  );
}
