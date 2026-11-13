import { useEffect, useState } from "react";
import { COUPLE } from "./data";

const MENU_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#events", label: "Events" },
  { href: "#rsvp", label: "RSVP" },
  { href: "#details", label: "Additional details" },
  { href: "#faqs", label: "FAQs" },
];

function scrollTo(hash: string) {
  if (hash === "#home") window.scrollTo({ top: 0, behavior: "smooth" });
  else document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
}

/** Pinned glass pill + full-screen cream menu. Hidden until the hero reveals. */
export function FloatingNav({ visible }: { visible: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const go = (hash: string) => {
    setMenuOpen(false);
    // Let the menu start closing before the scroll begins.
    setTimeout(() => scrollTo(hash), 60);
  };

  return (
    <>
      {/* Sits exactly inside the hero card's top edge, then floats on scroll. */}
      <nav
        className="site-nav glass fixed inset-x-0 z-[60] mx-auto flex w-[calc(min(100vw,26rem)-2.5rem)] items-center justify-between rounded-full py-1.5 pr-2 pl-5 shadow-[0_14px_40px_-16px_oklch(0.28_0.02_60/0.35)]"
        style={{
          top: "calc(env(safe-area-inset-top) + 1.25rem)",
          transition: "opacity 600ms ease, transform 600ms cubic-bezier(0.22,1,0.36,1)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-16px)",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <button
          type="button"
          onClick={() => go("#home")}
          aria-label="Back to top"
          className="font-display text-xl leading-none text-foreground"
        >
          {COUPLE.bride[0]}&amp;{COUPLE.groom[0]}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => go("#rsvp")}
            className="rounded-full bg-bronze px-5 py-2.5 font-display text-base leading-none text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Submit RSVP
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex size-10 flex-col items-center justify-center gap-[6px] rounded-full"
          >
            <span className="block h-[2.5px] w-5 rounded-full bg-foreground" />
            <span className="block h-[2.5px] w-5 rounded-full bg-foreground" />
          </button>
        </div>
      </nav>

      {/* Full-screen cream menu */}
      <div
        className="fixed inset-0 z-[75] flex flex-col items-center justify-center bg-background"
        style={{
          transition: "opacity 450ms ease",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          visibility: menuOpen ? "visible" : "hidden",
          transitionProperty: "opacity, visibility",
        }}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          className="absolute right-6 flex size-10 items-center justify-center rounded-full bg-secondary text-xl text-foreground/70"
          style={{ top: "calc(env(safe-area-inset-top) + 1.25rem)" }}
        >
          ×
        </button>
        <ul className="flex flex-col items-center gap-6">
          {MENU_LINKS.map((link, i) => (
            <li
              key={link.href}
              style={{
                transition: `opacity 500ms ease ${80 + i * 60}ms, transform 500ms cubic-bezier(0.22,1,0.36,1) ${80 + i * 60}ms`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(18px)",
              }}
            >
              <button
                type="button"
                onClick={() => go(link.href)}
                className="font-display text-4xl text-foreground transition-colors hover:text-bronze"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
