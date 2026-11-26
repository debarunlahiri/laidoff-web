// Loading placeholder rows; decorative, so hidden from assistive tech.
export default function Skeleton({
  rows = 3,
  label = "Loading",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div className="skeleton-list" role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton-row" key={i} aria-hidden="true">
          <span className="skeleton skeleton-avatar" />
          <span className="skeleton-lines">
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line short" />
          </span>
        </div>
      ))}
    </div>
  );
}

// Shimmering text-line placeholder used in place of "Loading…" copy.
export function SkeletonLines({
  lines = 2,
  label = "Loading",
}: {
  lines?: number;
  label?: string;
}) {
  return (
    <div className="skeleton-lines-block" role="status" aria-label={label}>
      {Array.from({ length: lines }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`skeleton skeleton-line${i === lines - 1 && lines > 1 ? " short" : ""}`}
        />
      ))}
    </div>
  );
}
