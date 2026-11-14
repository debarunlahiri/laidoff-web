"use client";
import Dialog from "@/components/ui/dialog";
import { CircleAlert, CircleCheck } from "lucide-react";

// Messages that read as a success (anything else is shown as an error).
const SUCCESS =
  /\b(updated|sent|revoked|saved|deleted|removed|created|restored|published|approved|rejected|verified|added|done|resolved|changed|enabled|disabled|granted|hidden|unhidden|reset)\b/i;
export const isSuccess = (message: string) => SUCCESS.test(message);

// The one place admin messages are shown: a dialog with an OK button, so a
// result is never missed or left as stray red text on the page. Clicking
// outside does not close it.
export default function Notice({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;
  const ok = isSuccess(message);
  const Icon = ok ? CircleCheck : CircleAlert;
  return (
    <Dialog
      label={ok ? "Done" : "Something went wrong"}
      className="confirm-dialog"
      onClose={onClose}
    >
      <h2 className="confirm-title">
        <Icon
          size={20}
          aria-hidden="true"
          style={{
            verticalAlign: "-3px",
            marginRight: 8,
            color: ok ? "#17a05a" : "#d64545",
          }}
        />
        {ok ? "Done" : "Something went wrong"}
      </h2>
      <p className="subtle-text" role={ok ? "status" : "alert"}>
        {message}
      </p>
      <div className="confirm-actions">
        <button type="button" className="primary" onClick={onClose} autoFocus>
          OK
        </button>
      </div>
    </Dialog>
  );
}
