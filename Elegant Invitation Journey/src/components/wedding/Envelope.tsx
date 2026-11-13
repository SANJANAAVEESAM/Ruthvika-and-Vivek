import { useEffect, useRef, useState } from "react";
import { COUPLE } from "./data";
import { preloadMusic, startMusic } from "@/lib/music";
import backdrop from "@/assets/backdrop-ruthvika-vivek.jpg";
import viruLogo from "@/assets/viru-logo.png";

/**
 * The opening screen: the couple's "Viru" logo over their stage photograph,
 * seen through frosted glass, with a button to open the invitation.
 *
 * Deliberately still: tapping hands straight over to the hero, and the overlay
 * in index.tsx cross-fades the two. There is no clearing or focusing sequence
 * in between — the guest should reach the invitation, not watch an animation.
 *
 * The photograph sits at scale 1, exactly where the page's fixed backdrop
 * sits, so it stays registered through the cross-fade and only the frost and
 * the logo dissolve.
 */
export function Envelope({ onOpened }: { onOpened: () => void }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Get the song's player ready before the tap that has to start it.
  useEffect(() => {
    preloadMusic();
  }, []);

  const open = () => {
    if (opening) return;
    setOpening(true);
    startMusic();
    timer.current = window.setTimeout(onOpened, 80);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open the invitation"
      // Opens on pointer-down rather than waiting for a click. Safari holds a
      // tap on a plain element while it decides whether a double-tap is coming,
      // which read as the first tap doing nothing. Pointer-down is still a user
      // gesture, so it satisfies the autoplay policy the music depends on.
      onPointerDown={open}
      // Kept for anything that dispatches a click without a pointer event —
      // keyboard activation, assistive tech. The guard in open() means a real
      // tap firing both still only opens once.
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="relative h-full w-full overflow-hidden outline-none"
      style={{
        cursor: opening ? "default" : "pointer",
        // Tells Safari there is no double-tap gesture here, so it stops waiting.
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Opaque base: the frost above is only partly opaque, so without this the
          page shows through before the photograph has decoded. */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: "var(--background)" }} />

      <img
        src={backdrop}
        alt=""
        aria-hidden="true"
        width={800}
        height={1200}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* The frost */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(20px) saturate(0.85)",
          WebkitBackdropFilter: "blur(20px)",
          background: "color-mix(in oklab, var(--background) 68%, transparent)",
        }}
      />

      {/* Truly centred. Sized by width so it never overflows a narrow phone. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center" aria-label={`${COUPLE.bride} and ${COUPLE.groom}`}>
          <img
            src={viruLogo}
            alt="Viru"
            width={2000}
            height={1024}
            className="mx-auto h-auto w-[78%] max-w-[22rem]"
            style={{ filter: "drop-shadow(0 2px 10px oklch(0.4 0.08 10 / 0.18))" }}
          />

          {/* A fine gold rule with a diamond. */}
          <div aria-hidden="true" className="mt-5 mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, var(--gold))" }} />
            <span className="size-1.5 rotate-45" style={{ background: "var(--gold)" }} />
            <span className="h-px w-10" style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }} />
          </div>

          <p className="font-body text-[0.62rem] font-medium tracking-[0.38em] uppercase" style={{ color: "var(--bronze-deep)" }}>
            {COUPLE.bride} &amp; {COUPLE.groom}
          </p>
          <p className="mt-3 font-display text-[1rem] text-muted-foreground italic">26 November 2026</p>
        </div>
      </div>

      {/* CTA */}
      <div
        className="absolute inset-x-0 flex justify-center"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 7vh)",
          transition: "opacity 250ms ease",
          opacity: opening ? 0 : 1,
          pointerEvents: opening ? "none" : "auto",
        }}
      >
        <span className="glass animate-cta-pulse rounded-full px-9 py-4 ring-1 ring-white/70">
          <span
            className="font-body text-[0.68rem] font-medium tracking-[0.3em] uppercase"
            style={{ color: "oklch(0.34 0.03 60)" }}
          >
            Open Invitation
          </span>
        </span>
      </div>
    </div>
  );
}
