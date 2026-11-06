"use client";
import { api, apiMessage } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { Field, when } from "./ui";

type Feature = { icon: string; title: string; text: string };
type Step = { title: string; text: string };
type Content = {
  subject?: string;
  preheader?: string;
  heading?: string;
  intro?: string;
  buttonLabel?: string;
  footerNote?: string;
  notice?: string;
  signoff?: string;
  featuresTitle?: string;
  stepsTitle?: string;
  features?: Feature[];
  steps?: Step[];
  htmlOverride?: string;
};
type Template = {
  key: string;
  label: string;
  description: string;
  variables: string[];
  customized: boolean;
  updatedAt: string | null;
  content: Content;
  defaults: Content;
};

export default function TemplatesPanel() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [active, setActive] = useState("");
  const [content, setContent] = useState<Content>({});
  const [preview, setPreview] = useState({ subject: "", html: "" });
  const [asVerified, setAsVerified] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const seq = useRef(0);

  async function load(keep?: string) {
    try {
      const list = await api<Template[]>("/admin/email/templates");
      setTemplates(list);
      const next = list.find((t) => t.key === (keep ?? active)) ?? list[0];
      if (next)
        (setActive(next.key), setContent(next.content), setDirty(false));
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  useEffect(() => {
    void load(); /* eslint-disable-next-line */
  }, []);

  const current = templates.find((t) => t.key === active);
  // Live preview of unsaved edits, rendered by the server with sample data.
  useEffect(() => {
    if (!active) return;
    const id = ++seq.current;
    const timer = setTimeout(() => {
      api<{ subject: string; html: string }>(
        `/admin/email/templates/${active}/preview`,
        {
          method: "POST",
          body: { content, verified: asVerified },
        },
      ).then(
        (r) => id === seq.current && setPreview(r),
        (e) => setMessage(apiMessage(e)),
      );
    }, 350);
    return () => clearTimeout(timer);
  }, [active, content, asVerified]);

  if (!current) return <p>{message || "Loading…"}</p>;
  const set = (patch: Content) => (
    setContent({ ...content, ...patch }),
    setDirty(true)
  );
  const text = (key: keyof Content, label: string, rows = 0, hint?: string) => (
    <Field label={label} hint={hint}>
      {rows ? (
        <textarea
          rows={rows}
          value={(content[key] as string) ?? ""}
          onChange={(e) => set({ [key]: e.target.value })}
        />
      ) : (
        <input
          value={(content[key] as string) ?? ""}
          onChange={(e) => set({ [key]: e.target.value })}
        />
      )}
    </Field>
  );
  const isWelcome = current.key === "welcome";
  const features = content.features ?? [];
  const steps = content.steps ?? [];

  async function save() {
    setMessage("");
    try {
      await api(`/admin/email/templates/${active}`, {
        method: "PUT",
        body: content,
      });
      setMessage("Saved. New emails use this version immediately.");
      await load(active);
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  async function reset() {
    if (
      !window.confirm(
        "Discard your changes and restore the built-in version of this email?",
      )
    )
      return;
    try {
      await api(`/admin/email/templates/${active}`, { method: "DELETE" });
      setMessage("Restored the default.");
      await load(active);
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }
  async function sendTest() {
    setMessage("");
    try {
      const r = await api<{ sent: boolean; to: string }>(
        `/admin/email/templates/${active}/test`,
        {
          method: "POST",
          body: { content, ...(testTo.trim() ? { to: testTo.trim() } : {}) },
        },
      );
      setMessage(
        r.sent
          ? `Test sent to ${r.to}.`
          : "Test wasn’t sent. Check Settings and the Email log.",
      );
    } catch (e) {
      setMessage(apiMessage(e));
    }
  }

  return (
    <div className="adm-templates">
      <div className="adm-card">
        <div className="adm-subtabs">
          {templates.map((t) => (
            <button
              key={t.key}
              className={t.key === active ? "active" : ""}
              onClick={() => {
                if (!dirty || window.confirm("Discard unsaved changes?"))
                  (setActive(t.key), setContent(t.content), setDirty(false));
              }}
            >
              {t.label}
              {t.customized && " •"}
            </button>
          ))}
        </div>
        <p className="adm-note">
          {current.description}
          {current.updatedAt && ` Last edited ${when(current.updatedAt)}.`}
        </p>
        <p className="adm-vars">
          Variables you can use in any text:{" "}
          {current.variables.map((v) => (
            <code key={v}>{`{{${v}}}`}</code>
          ))}
          . Wrap words in **double asterisks** for bold.
        </p>

        {text("subject", "Subject")}
        {text(
          "preheader",
          "Preview text (shown next to the subject in inboxes)",
        )}
        {text("heading", "Heading")}
        {text("intro", "Message", 5, "Leave a blank line between paragraphs.")}
        {isWelcome &&
          text(
            "notice",
            "Verify-email notice (only shown to members who haven’t verified)",
            3,
          )}
        {isWelcome && text("featuresTitle", "Features heading")}
        {isWelcome && (
          <div className="adm-list-editor">
            {features.map((f, i) => (
              <div key={i} className="adm-item">
                <input
                  className="adm-icon"
                  value={f.icon}
                  maxLength={8}
                  onChange={(e) =>
                    set({
                      features: features.map((x, j) =>
                        j === i ? { ...x, icon: e.target.value } : x,
                      ),
                    })
                  }
                />
                <div>
                  <input
                    value={f.title}
                    placeholder="Title"
                    onChange={(e) =>
                      set({
                        features: features.map((x, j) =>
                          j === i ? { ...x, title: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <textarea
                    rows={2}
                    value={f.text}
                    placeholder="Description"
                    onChange={(e) =>
                      set({
                        features: features.map((x, j) =>
                          j === i ? { ...x, text: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </div>
                <button
                  onClick={() =>
                    set({ features: features.filter((_, j) => j !== i) })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            {features.length < 8 && (
              <button
                onClick={() =>
                  set({
                    features: [
                      ...features,
                      { icon: "✨", title: "", text: "" },
                    ],
                  })
                }
              >
                Add feature
              </button>
            )}
          </div>
        )}
        {isWelcome && text("stepsTitle", "Steps heading")}
        {isWelcome && (
          <div className="adm-list-editor">
            {steps.map((s, i) => (
              <div key={i} className="adm-item">
                <b>{i + 1}</b>
                <div>
                  <input
                    value={s.title}
                    placeholder="Title"
                    onChange={(e) =>
                      set({
                        steps: steps.map((x, j) =>
                          j === i ? { ...x, title: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <textarea
                    rows={2}
                    value={s.text}
                    placeholder="Description"
                    onChange={(e) =>
                      set({
                        steps: steps.map((x, j) =>
                          j === i ? { ...x, text: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </div>
                <button
                  onClick={() =>
                    set({ steps: steps.filter((_, j) => j !== i) })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            {steps.length < 6 && (
              <button
                onClick={() =>
                  set({ steps: [...steps, { title: "", text: "" }] })
                }
              >
                Add step
              </button>
            )}
          </div>
        )}
        {text("buttonLabel", "Button label")}
        {!isWelcome && text("footerNote", "Footer note", 2)}
        {isWelcome && text("signoff", "Sign-off", 2)}
        <details className="adm-advanced">
          <summary>
            Advanced: replace the whole email with your own HTML
          </summary>
          <p className="adm-note">
            When filled in, this HTML is sent instead of the layout above. Use
            the variables for personalisation, e.g. <code>{"{{link}}"}</code>.
            Clear it to go back to the designed layout.
          </p>
          {text("htmlOverride", "Custom HTML", 12)}
        </details>

        <div className="adm-actions">
          <button className="primary" onClick={save} disabled={!dirty}>
            Save changes
          </button>
          <button onClick={reset} disabled={!current.customized}>
            Restore default
          </button>
        </div>
        <div className="adm-actions">
          <input
            placeholder="Send test to (default: your email)"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
          />
          <button onClick={sendTest}>Send test email</button>
        </div>
        {message && (
          <p role="status" className="adm-note">
            {message}
          </p>
        )}
      </div>
      <div className="adm-card adm-preview">
        <div className="adm-preview-head">
          <strong>Preview</strong>
          {isWelcome && (
            <label>
              <input
                type="checkbox"
                checked={asVerified}
                onChange={(e) => setAsVerified(e.target.checked)}
              />{" "}
              As a verified member
            </label>
          )}
        </div>
        <p className="adm-subject">Subject: {preview.subject}</p>
        <iframe title="Email preview" sandbox="" srcDoc={preview.html} />
      </div>
    </div>
  );
}
