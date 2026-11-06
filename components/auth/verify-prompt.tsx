"use client";

import { useAuth } from "@/providers/auth-provider";
import { MailWarning } from "lucide-react";
import { useEffect, useState } from "react";

// Opens when an unverified member tries to do anything other than look around.
export default function VerifyPrompt() {
  const { user, refreshSession, resendVerification } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const show = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "EMAIL_NOT_VERIFIED") {
        setMessage("");
        setOpen(true);
      }
    };
    window.addEventListener("auth:unverified", show);
    return () => window.removeEventListener("auth:unverified", show);
  }, []);
  // Verified (e.g. in another tab): nothing left to prompt.
  useEffect(() => {
    if (user && !user.verificationRequired) setOpen(false);
  }, [user]);
  if (!open || !user) return null;

  const deadline = user.emailVerificationDeadline
    ? new Date(user.emailVerificationDeadline).toLocaleString()
    : null;
  async function resend() {
    setBusy(true);
    setMessage("");
    try {
      await resendVerification();
      setMessage("Verification email sent. Check your inbox and spam folder.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Couldn’t send the email.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="vp-overlay" onClick={() => setOpen(false)}>
      <div
        className="vp-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vp-title"
        onClick={(event) => event.stopPropagation()}
      >
        <MailWarning size={34} className="verify-bad" />
        <h2 id="vp-title">Verify your email first</h2>
        <p>
          To post, comment, message, connect or make any other change, please
          confirm <strong>{user.email}</strong>.
          {deadline && (
            <>
              {" "}
              You can keep browsing until {deadline}; after that you’ll need to
              verify to get back in.
            </>
          )}
        </p>
        <div className="vp-actions">
          <button className="primary" onClick={resend} disabled={busy}>
            {busy ? "Sending…" : "Resend verification email"}
          </button>
          <button onClick={() => void refreshSession()}>I’ve verified</button>
          <button className="adm-link" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        {message && <p className="verify-note">{message}</p>}
      </div>
    </div>
  );
}
