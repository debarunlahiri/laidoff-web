"use client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

const maxTiles = 4;

// Photos on a post: 1–4 tiles in a grid (extra photos collapse into "+N"),
// and a lightbox with keyboard navigation.
export default function PostImages({
  images,
  author,
}: {
  images: string[];
  author: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (!images.length) return null;
  const tiles = images.slice(0, maxTiles);
  const extra = images.length - maxTiles;
  return (
    <>
      <div className={`post-images count-${tiles.length}`}>
        {tiles.map((src, index) => (
          <button
            key={src}
            type="button"
            className="post-image-tile"
            aria-label={`Open photo ${index + 1} of ${images.length}`}
            onClick={() => setOpen(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Photo ${index + 1} shared by ${author}`} />
            {extra > 0 && index === maxTiles - 1 && (
              <span className="post-image-more">+{extra}</span>
            )}
          </button>
        ))}
      </div>
      {open !== null && (
        <Lightbox
          images={images}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          author={author}
        />
      )}
    </>
  );
}

export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  author,
}: {
  images: string[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  author: string;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") onIndex((index + 1) % images.length);
      else if (event.key === "ArrowLeft")
        onIndex((index - 1 + images.length) % images.length);
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
    };
  }, [index, images.length, onClose, onIndex]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photos shared by ${author}`}
      onClick={onClose}
    >
      <button
        className="lightbox-close"
        aria-label="Close photo viewer"
        onClick={onClose}
      >
        <X size={22} />
      </button>
      {images.length > 1 && (
        <button
          className="lightbox-nav prev"
          aria-label="Previous photo"
          onClick={(event) => {
            event.stopPropagation();
            onIndex((index - 1 + images.length) % images.length);
          }}
        >
          <ChevronLeft size={28} />
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt={`Photo ${index + 1} of ${images.length} shared by ${author}`}
        onClick={(event) => event.stopPropagation()}
      />
      {images.length > 1 && (
        <>
          <button
            className="lightbox-nav next"
            aria-label="Next photo"
            onClick={(event) => {
              event.stopPropagation();
              onIndex((index + 1) % images.length);
            }}
          >
            <ChevronRight size={28} />
          </button>
          <span className="lightbox-count">
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}
