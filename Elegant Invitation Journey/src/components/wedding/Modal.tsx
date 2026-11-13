import { useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Shared modal: dimmed backdrop, slide-up panel, body scroll lock, and close on
 * Esc, the X, or the backdrop.
 *
 * The panel itself never scrolls — an inner element does — so the close button
 * stays pinned to the panel instead of scrolling away with the content. That
 * matters most for `variant="full"`, which covers the whole viewport and so
 * leaves no backdrop to tap and no Esc key on a phone.
 */
export function Modal({
  open,
  onClose,
  label,
  variant = "sheet",
  panelStyle,
  backdrop,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  /**
   * "full" covers the whole screen; "sheet" rises part-way, the default;
   * "card" floats in the centre over a softened page.
   */
  variant?: "sheet" | "full" | "card";
  /** Overrides the panel's ground — used to give each event its own setting. */
  panelStyle?: CSSProperties;
  /** Sits behind the content and stays put while it scrolls. */
  backdrop?: ReactNode;
  children: ReactNode;
}) {
  const full = variant === "full";
  const card = variant === "card";

  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    // The nav is fixed and would otherwise sit over the panel's close button.
    el.dataset.modalOpen = "true";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      el.style.overflow = prev;
      delete el.dataset.modalOpen;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className="fixed inset-0 z-[80]"
      style={{
        pointerEvents: open ? "auto" : "none",
        visibility: open ? "visible" : "hidden",
        transitionProperty: "visibility",
        transitionDuration: open ? "0ms" : "500ms",
      }}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 ${card ? "bg-foreground/20" : "bg-foreground/25"}`}
        style={{
          backdropFilter: card ? "blur(6px)" : "blur(2px)",
          WebkitBackdropFilter: card ? "blur(6px)" : "blur(2px)",
          transition: "opacity 420ms ease",
          opacity: open ? 1 : 0,
        }}
      />

      {card ? (
        // A floating card: centred, fading and settling into place.
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="pointer-events-auto relative flex max-h-[82dvh] w-full max-w-[22rem] flex-col overflow-hidden rounded-[28px] bg-pearl"
            style={{
              boxShadow:
                "0 30px 70px -24px oklch(0.25 0.03 60 / 0.55), 0 0 0 1px color-mix(in oklab, var(--gold) 35%, transparent)",
              transition: "opacity 380ms ease, transform 480ms cubic-bezier(0.22, 1, 0.36, 1)",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0) scale(1)" : "translateY(18px) scale(0.96)",
              ...panelStyle,
            }}
          >
            {backdrop && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                {backdrop}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 z-10 flex size-8 items-center justify-center rounded-full bg-secondary/90 text-base leading-none text-foreground/70 shadow-sm transition-colors hover:text-foreground"
            >
              ×
            </button>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">{children}</div>
          </div>
        </div>
      ) : (
      /* Panel */
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[26rem] flex-col bg-pearl shadow-[0_-20px_60px_-20px_oklch(0.28_0.02_60/0.35)] ${
          full ? "top-0" : "max-h-[86dvh] rounded-t-[24px]"
        }`}
        style={{
          transition: "transform 480ms cubic-bezier(0.22, 1, 0.36, 1)",
          transform: open ? "translateY(0)" : "translateY(105%)",
          ...panelStyle,
        }}
      >
        {backdrop && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {backdrop}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 z-10 flex size-9 items-center justify-center rounded-full bg-secondary text-lg leading-none text-foreground/70 shadow-sm transition-colors hover:text-foreground"
          style={{ top: full ? "calc(env(safe-area-inset-top) + 1rem)" : "0.85rem" }}
        >
          ×
        </button>

        {/* The only thing that scrolls */}
        <div
          className="min-h-0 flex-1 overflow-y-auto px-6"
          style={{
            paddingTop: full ? "calc(env(safe-area-inset-top) + 1.25rem)" : "1.25rem",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)",
          }}
        >
          {!full && (
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--border)]" aria-hidden="true" />
          )}
          {children}
        </div>
      </div>
      )}
    </div>
  );
}
