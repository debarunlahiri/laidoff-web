"use client";

export default function PillTabs<Key extends string>({
  label,
  items,
  active,
  onChange,
}: {
  label: string;
  items: readonly { key: Key; label: string }[];
  active: Key;
  onChange: (key: Key) => void;
}) {
  return (
    <div className="discovery-tabs pill-tabs" role="group" aria-label={label}>
      {items.map(({ key, label: itemLabel }) => (
        <button
          key={key}
          type="button"
          aria-pressed={active === key}
          onClick={() => onChange(key)}
        >
          {itemLabel}
        </button>
      ))}
    </div>
  );
}
