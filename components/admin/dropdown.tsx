"use client";
import {
  Children,
  type ReactElement,
  type ReactNode,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type DropdownOption = {
  value: string;
  label: string;
  sub?: string | null;
};

type CoreProps = {
  selected: DropdownOption | null;
  onPick: (option: DropdownOption | null) => void;
  options: DropdownOption[];
  loading?: boolean;
  /** Show a search box. Static lists filter locally, async ones call onSearch. */
  searchable?: boolean;
  onSearch?: (text: string) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  ariaLabel?: string;
  compact?: boolean;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  footer?: ReactNode;
  emptyText?: string;
};

/**
 * The one dropdown used across the admin console. The list is rendered in a
 * portal with fixed positioning, so no card, table or panel can clip it, and it
 * flips upward when there is no room below.
 */
export function DropdownCore({
  selected,
  onPick,
  options,
  loading,
  searchable,
  onSearch,
  onOpenChange,
  placeholder = "Select…",
  ariaLabel,
  compact,
  disabled,
  required,
  clearable,
  footer,
  emptyText = "No matches",
}: CoreProps) {
  const [open, setOpenState] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [box, setBox] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    max: number;
  } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const listId = useId();

  const setOpen = useCallback(
    (v: boolean) => {
      setOpenState(v);
      if (!v) setSearch("");
      onOpenChange?.(v);
    },
    [onOpenChange],
  );

  const shown = useMemo(() => {
    if (onSearch || !search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.sub?.toLowerCase().includes(q),
    );
  }, [options, search, onSearch]);

  const place = useCallback(() => {
    const el = trigger.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const up = below < 260 && above > below;
    const width = Math.max(r.width, compact ? 200 : 0);
    const left = Math.min(
      Math.max(8, r.left),
      Math.max(8, window.innerWidth - width - 8),
    );
    setBox(
      up
        ? {
            left,
            width,
            bottom: window.innerHeight - r.top + 4,
            max: Math.min(420, above),
          }
        : { left, width, top: r.bottom + 4, max: Math.min(420, below) },
    );
  }, [compact]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!pop.current?.contains(t) && !trigger.current?.contains(t))
        setOpen(false);
    };
    const reflow = (e: Event) => {
      if (!pop.current?.contains(e.target as Node)) place();
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", reflow, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", reflow, true);
    };
  }, [open, place, setOpen]);
  useEffect(() => {
    setActive(
      Math.max(
        0,
        shown.findIndex((o) => o.value === selected?.value),
      ),
    );
  }, [open, shown, selected?.value]);
  useEffect(() => {
    pop.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function pick(o: DropdownOption | null) {
    onPick(o);
    setOpen(false);
    trigger.current?.focus();
  }
  function key(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(shown.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && shown[active]) {
      e.preventDefault();
      pick(shown[active]);
    }
  }

  return (
    <div className={`ac-dd${compact ? " compact" : ""}`} onKeyDown={key}>
      <button
        ref={trigger}
        type="button"
        className="ac-dd-btn"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen(!open)}
      >
        {selected ? (
          <span className="ac-dd-value">
            <strong>{selected.label}</strong>
            {selected.sub && <em>{selected.sub}</em>}
          </span>
        ) : (
          <span className="ac-dd-placeholder">{placeholder}</span>
        )}
        {clearable && selected ? (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear"
            className="ac-dd-x"
            onClick={(e) => {
              e.stopPropagation();
              onPick(null);
            }}
          >
            <X size={14} />
          </span>
        ) : (
          <ChevronDown size={15} className="ac-dd-chev" />
        )}
      </button>
      {/* Lets the browser's native `required` validation cover this custom control. */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          className="ac-dd-guard"
          required
          value={selected?.value ?? ""}
          onChange={() => {}}
        />
      )}
      {open &&
        box &&
        createPortal(
          <div
            ref={pop}
            className="ac-dd-pop"
            style={{
              left: box.left,
              width: box.width,
              top: box.top,
              bottom: box.bottom,
              maxHeight: box.max,
            }}
          >
            {searchable && (
              <label className="ac-dd-search">
                <Search size={14} />
                <input
                  autoFocus
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                />
              </label>
            )}
            <ul role="listbox" id={listId} className="ac-dd-list">
              {shown.map((o, i) => (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={o.value === selected?.value}
                    data-active={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(o)}
                  >
                    <span>
                      <strong>{o.label}</strong>
                      {o.sub && <em>{o.sub}</em>}
                    </span>
                    {o.value === selected?.value && <Check size={14} />}
                  </button>
                </li>
              ))}
              {loading && <li className="ac-dd-empty">Searching…</li>}
              {!loading && !shown.length && (
                <li className="ac-dd-empty">{emptyText}</li>
              )}
            </ul>
            {footer && (
              <div className="ac-dd-footer" onClick={() => setOpen(false)}>
                {footer}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

type ChangeLike = { target: { value: string } };

/** Reads <option value>label</option> children so existing markup keeps working. */
function optionsFrom(children: ReactNode): DropdownOption[] {
  const out: DropdownOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== "option") return;
    const props = (
      child as ReactElement<{ value?: string; children?: ReactNode }>
    ).props;
    const label = Children.toArray(props.children).join("");
    out.push({ value: String(props.value ?? label), label });
  });
  return out;
}

/**
 * Drop-in replacement for <select>: same <option> children, same
 * `onChange={(e) => … e.target.value}` handler.
 */
export function Dropdown({
  value,
  onChange,
  children,
  options,
  searchable,
  ...rest
}: {
  value: string;
  onChange: (event: ChangeLike) => void;
  children?: ReactNode;
  options?: DropdownOption[];
  searchable?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  "aria-label"?: string;
  compact?: boolean;
  disabled?: boolean;
  required?: boolean;
}) {
  const list = useMemo(
    () => options ?? optionsFrom(children),
    [options, children],
  );
  const { "aria-label": aria, ariaLabel, ...core } = rest;
  return (
    <DropdownCore
      {...core}
      ariaLabel={ariaLabel ?? aria}
      options={list}
      searchable={searchable ?? list.length > 8}
      selected={list.find((o) => o.value === value) ?? null}
      onPick={(o) => o && onChange({ target: { value: o.value } })}
    />
  );
}
