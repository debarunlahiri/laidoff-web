"use client";
import { imageRuleMessage, imageTypes, maxImageBytes } from "@/lib/image-file";
import { pastedImages } from "@/lib/paste-files";
import { usePlatform } from "@/providers/platform-provider";
import { useFileDrop } from "@/hooks/use-file-drop";
import { ImagePlus, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// One input used for new comments and replies. A photo or GIF can be attached.
export default function CommentForm({
  label,
  placeholder,
  initialText = "",
  autoFocus = false,
  pending,
  onSubmit,
  onCancel,
}: {
  label: string;
  placeholder: string;
  initialText?: string;
  autoFocus?: boolean;
  pending: boolean;
  onSubmit: (text: string, file?: File) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const { notify } = usePlatform();
  const [text, setText] = useState(initialText);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!autoFocus) return;
    input.current?.focus();
    input.current?.setSelectionRange(text.length, text.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const { dragging, dropProps } = useFileDrop({
    onFiles: (dropped) => {
      const image = dropped.find((item) => item.type.startsWith("image/"));
      if (
        !image ||
        !imageTypes.includes(image.type) ||
        image.size > maxImageBytes
      )
        notify(imageRuleMessage);
      else setFile(image);
    },
  });
  const canSend = Boolean(text.trim() || file) && !pending;

  return (
    <form
      className={`comment-form${dragging ? " drop-active" : ""}`}
      {...dropProps}
      onSubmit={async (event) => {
        event.preventDefault();
        if (!canSend) return;
        if (await onSubmit(text.trim(), file ?? undefined)) {
          setText("");
          setFile(null);
          onCancel?.();
        }
      }}
    >
      {dragging && (
        <div className="drop-overlay" aria-hidden="true">
          <ImagePlus size={20} />
          Drop a photo or GIF
        </div>
      )}
      {preview && (
        <div className="comment-attachment">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Attached photo or GIF" />
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => setFile(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}
      <input
        ref={picker}
        type="file"
        hidden
        accept={imageTypes.join(",")}
        onChange={(event) => {
          const picked = event.target.files?.[0];
          event.target.value = "";
          if (!picked) return;
          if (!imageTypes.includes(picked.type) || picked.size > maxImageBytes)
            notify(imageRuleMessage);
          else setFile(picked);
        }}
      />
      <input
        ref={input}
        aria-label={label}
        placeholder={placeholder}
        value={text}
        maxLength={5000}
        onChange={(event) => setText(event.target.value)}
        onPaste={(event) => {
          const [pasted] = pastedImages(event);
          if (!pasted) return;
          if (!imageTypes.includes(pasted.type) || pasted.size > maxImageBytes)
            notify(imageRuleMessage);
          else setFile(pasted);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel?.();
        }}
      />
      <button
        type="button"
        className="icon-button"
        aria-label="Add a photo or GIF"
        title="Add a photo or GIF"
        onClick={() => picker.current?.click()}
      >
        <ImagePlus size={18} />
      </button>
      <button className="icon-button" aria-label="Send" disabled={!canSend}>
        <Send size={18} />
      </button>
    </form>
  );
}
