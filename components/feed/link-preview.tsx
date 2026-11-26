"use client";
import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";

type Preview = {
  url: string;
  domain: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  large: boolean;
};

// Resolved previews are shared by every card on the page (null = none found).
const cache = new Map<string, Preview | null>();

// First plain http(s) link in the post, ignoring trailing punctuation.
export function firstLink(text: string) {
  const match = text.match(/https?:\/\/[^\s<>()\[\]"']+/i);
  if (!match) return null;
  const url = match[0].replace(/[.,;:!?*_]+$/, "");
  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}

// X-style link card: image, domain, title and description for a URL in a post.
export default function LinkPreview({ text }: { text: string }) {
  const link = firstLink(text);
  const [preview, setPreview] = useState<Preview | null | undefined>(
    link ? cache.get(link) : null,
  );
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!link) return;
    if (cache.has(link)) {
      setPreview(cache.get(link));
      return;
    }
    setPreview(undefined);
    // A flag, not an AbortController: aborting surfaces as a runtime error overlay.
    let cancelled = false;
    fetch(`/api/link-preview?url=${encodeURIComponent(link)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Preview | null) => {
        cache.set(link, data);
        if (!cancelled) setPreview(data);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [link]);

  if (!link || preview === null) return null;
  if (preview === undefined)
    return (
      <div className="link-preview is-loading" role="status" aria-label="Loading link preview">
        <span className="skeleton link-preview-media" aria-hidden="true" />
        <span className="link-preview-body" aria-hidden="true">
          <span className="skeleton skeleton-line short" />
          <span className="skeleton skeleton-line" />
        </span>
      </div>
    );

  const image = preview.image && !imageFailed ? preview.image : null;
  return (
    <a
      className={`link-preview${preview.large && image ? " is-large" : ""}`}
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer nofollow ugc"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="link-preview-media"
          src={image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="link-preview-media link-preview-fallback" aria-hidden="true">
          <Link2 size={26} />
        </span>
      )}
      <span className="link-preview-body">
        <small>{preview.siteName || preview.domain}</small>
        <strong>{preview.title}</strong>
        {preview.description && <span>{preview.description}</span>}
      </span>
    </a>
  );
}
