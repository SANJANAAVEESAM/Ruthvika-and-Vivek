import { useEffect, useRef, useState } from "react";
import { COUPLE } from "./data";
import { startMusic } from "@/lib/music";
import backdrop from "@/assets/backdrop-ruthvika-vivek.jpg";
import monogram from "@/assets/monogram.png";

/**
 * Scene 1 — the couple's illustration behind frosted glass, with the monogram
 * over it.
 *
 * Deliberately still: tapping hands straight over to the hero, and the overlay
 * in index.tsx cross-fades the two. There is no clearing or focusing sequence
 * in between — the guest should reach the invitation, not watch an animation.
 *
 * The illustration sits at scale 1, exactly where the page's fixed backdrop
 * sits, so it stays registered through the cross-fade and only the frost and
 * monogram dissolve.
 */
export function Envelope({ onOpened }: { onOpened: () => void }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

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
          page shows through before the illustration has decoded. */}
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

      {/* The mark carries its own sprig, swash and names, so the flourishes and
          the separate name line that used to frame the initials are gone —
          keeping them would have doubled up on both. */}
      {/* Truly centred. The old 8% bottom padding lifted the initials clear of
          the button, but this mark is shorter and leaves ample room without it —
          and the offset was what made it look misplaced. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* The couple's own artwork, background keyed out so it sits on the
            frost rather than as a pasted rectangle. Sized by width — the mark
            is taller than wide, and height-driven sizing overflows narrow
            phones sideways. */}
        <img
          src={monogram}
          alt={`${COUPLE.bride} and ${COUPLE.groom}`}
          width={848}
          height={942}
          className="h-auto w-[64%]"
          // No pool of light behind it and no contrast filter: the artwork is
          // high enough resolution to hold its own against the frost, and both
          // were only propping up the low-resolution screenshot it replaced.
          style={{ filter: "drop-shadow(0 2px 12px oklch(0.28 0.03 55 / 0.2))" }}
        />
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
