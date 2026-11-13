import { useEffect, useRef, useState } from "react";
import { COUPLE } from "./data";
import { preloadMusic, startMusic } from "@/lib/music";
import backdrop from "@/assets/backdrop-ruthvika-vivek.jpg";
import monogram from "@/assets/monogram.png";
import couplePhoto from "@/assets/couple-ruthvika-vivek.jpg";
import viruLogo from "@/assets/viru-logo.png";

export type SceneStyle = "envelope" | "doors" | "curtains" | "book" | "garden";

export type OpeningStyle =
  | "current" | "logo" | "script" | "names" | "telugu" | "arch" | "seal"
  | "date" | "blessing" | "rings" | "photo" | "framed"
  | SceneStyle;

/** Animated openings: they play when tapped, and the page waits for them. */
const isScene = (v: OpeningStyle): v is SceneStyle =>
  v === "envelope" || v === "doors" || v === "curtains" || v === "book" || v === "garden";
const SCENE_MS = 1750;

const INK = "var(--bronze-deep)";
const CAPS = "font-body text-[0.62rem] font-medium tracking-[0.38em] uppercase";

/** The fine gold rule with a diamond, used between the lines of the marks. */
function Rule({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, var(--gold))" }} />
      <span className="size-1.5 rotate-45" style={{ background: "var(--gold)" }} />
      <span className="h-px w-10" style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }} />
    </div>
  );
}

/* ------------------------------ animated scenes ------------------------------ */

const ROSE = "oklch(0.52 0.08 10)";
const ROSE_LIGHT = "oklch(0.59 0.08 12)";
const ROSE_DEEP = "oklch(0.4 0.08 8)";
const FOIL = "oklch(0.86 0.06 70)";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SCRIPT = "var(--font-monogram)";

/** A rose wax seal stamped R & V. */
function WaxSeal({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 30%, oklch(0.64 0.1 15), oklch(0.47 0.11 12) 60%, oklch(0.36 0.1 10))",
        boxShadow: "0 4px 10px -3px oklch(0.3 0.08 10 / 0.6), inset 0 0 0 2px oklch(1 0 0 / 0.12)",
        ...style,
      }}
    >
      <span style={{ fontFamily: SCRIPT, color: "oklch(0.92 0.04 40)", fontSize: size * 0.42, lineHeight: 1 }}>
        R&amp;V
      </span>
    </div>
  );
}

/** An envelope: the seal breaks, the flap lifts, and the card rises out. */
function EnvelopeScene({ open }: { open: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ perspective: "1400px", paddingBottom: "12vh" }}
    >
      <div className="relative w-[80%] max-w-[22rem]" style={{ aspectRatio: "1.45 / 1" }}>
        <div
          className="absolute inset-0 rounded-[10px]"
          style={{ background: ROSE_DEEP, boxShadow: "0 26px 46px -22px oklch(0.25 0.05 10 / 0.65)" }}
        />

        {/* The card, waiting inside. */}
        <div
          className="absolute inset-x-[5%] top-[7%] bottom-[7%] z-10 flex flex-col items-center justify-center rounded-[5px] px-3 text-center"
          style={{
            background: "var(--pearl)",
            border: "1px solid color-mix(in oklab, var(--gold) 55%, transparent)",
            boxShadow: "0 -6px 18px -10px oklch(0.25 0.04 10 / 0.5)",
            transform: open ? "translateY(-72%)" : "translateY(0)",
            transition: `transform 950ms ${EASE} 700ms`,
          }}
        >
          <p className="font-body text-[0.46rem] font-medium tracking-[0.36em] uppercase" style={{ color: INK }}>
            The wedding of
          </p>
          <p className="mt-2 leading-none whitespace-nowrap" style={{ fontFamily: SCRIPT, color: INK, fontSize: "min(2rem, 8.6vw)" }}>
            {COUPLE.bride} &amp; {COUPLE.groom}
          </p>
          <p className="mt-2 font-body text-[0.46rem] font-medium tracking-[0.34em] uppercase text-muted-foreground">
            26 · 11 · 2026
          </p>
        </div>

        {/* The front pocket, over the foot of the card. */}
        <svg viewBox="0 0 145 100" className="absolute inset-0 z-20 h-full w-full" aria-hidden="true">
          <path d="M0 0 L72.5 54 L0 100 Z" fill={ROSE} />
          <path d="M145 0 L72.5 54 L145 100 Z" fill={ROSE} />
          <path d="M0 100 L72.5 46 L145 100 Z" fill={ROSE_LIGHT} />
          <path d="M0 100 L72.5 46 L145 100" fill="none" stroke={FOIL} strokeWidth="0.35" opacity="0.7" />
        </svg>

        {/* The flap: swings up and back behind the card. */}
        <svg
          viewBox="0 0 145 56"
          className="absolute top-0 left-0 w-full"
          aria-hidden="true"
          style={{
            height: "56%",
            transformOrigin: "50% 0%",
            transform: open ? "rotateX(180deg)" : "rotateX(0deg)",
            zIndex: open ? 5 : 30,
            transition: `transform 800ms ${EASE} 250ms, z-index 0s linear 560ms`,
          }}
        >
          <path d="M0 0 L145 0 L72.5 56 Z" fill={ROSE_LIGHT} />
          <path d="M0 0 L72.5 56 L145 0" fill="none" stroke={FOIL} strokeWidth="0.35" opacity="0.7" />
        </svg>

        {/* The seal, over the flap's point. */}
        <div
          className="absolute left-1/2 z-40"
          style={{
            top: "56%",
            transform: `translate(-50%, -50%) scale(${open ? 0.5 : 1})`,
            opacity: open ? 0 : 1,
            transition: "opacity 300ms ease, transform 300ms ease",
          }}
        >
          <WaxSeal size={60} />
        </div>
      </div>
    </div>
  );
}

/** Two temple doors that swing open from the centre. */
function DoorsScene({ open }: { open: boolean }) {
  const door = (side: "l" | "r") => {
    const left = side === "l";
    return (
      <div
        className="absolute inset-y-0"
        style={{
          ...(left ? { left: 0 } : { right: 0 }),
          width: "50.3%",
          transformOrigin: left ? "left center" : "right center",
          transform: open ? `rotateY(${left ? -115 : 115}deg)` : "none",
          transition: `transform 1150ms ${EASE} 300ms`,
          background: `linear-gradient(${left ? 90 : 270}deg, ${ROSE_DEEP}, ${ROSE} 65%, ${ROSE_LIGHT})`,
          boxShadow: `inset ${left ? "-" : ""}10px 0 24px -14px oklch(0.2 0.05 10 / 0.5)`,
        }}
      >
        <span className="absolute inset-3.5 rounded-[14px]" style={{ border: `1px solid ${FOIL}`, opacity: 0.75 }} />
        <span className="absolute inset-[22px] rounded-[10px]" style={{ border: `1px solid ${FOIL}`, opacity: 0.35 }} />
        <span
          className="absolute size-3 rounded-full"
          style={{
            // Low on the door, clear of the names.
            top: "76%",
            ...(left ? { right: 18 } : { left: 18 }),
            background: `radial-gradient(circle at 35% 30%, oklch(0.95 0.05 80), ${FOIL} 55%, oklch(0.6 0.08 65))`,
          }}
        />
      </div>
    );
  };

  return (
    <div className="absolute inset-0" style={{ perspective: "1300px" }}>
      {/* What the doors reveal. */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "9vh" }}>
        <OpeningMark variant="arch" />
      </div>
      {door("l")}
      {door("r")}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
        style={{ opacity: open ? 0 : 1, transition: "opacity 350ms ease" }}
      >
        <p className="font-body text-[0.56rem] font-medium tracking-[0.4em] uppercase" style={{ color: FOIL }}>
          The wedding of
        </p>
        <p className="mt-3 leading-none" style={{ fontFamily: SCRIPT, color: "oklch(0.97 0.012 40)", fontSize: "clamp(3rem, 15vw, 3.8rem)" }}>
          {COUPLE.bride}
        </p>
        <p className="my-1 font-display text-[1.4rem] italic" style={{ color: FOIL }}>&amp;</p>
        <p className="leading-none" style={{ fontFamily: SCRIPT, color: "oklch(0.97 0.012 40)", fontSize: "clamp(3rem, 15vw, 3.8rem)" }}>
          {COUPLE.groom}
        </p>
        <Rule className="mt-6" />
        <p className="mt-4 font-body text-[0.56rem] font-medium tracking-[0.36em] uppercase" style={{ color: FOIL }}>
          26 · 11 · 2026
        </p>
      </div>
    </div>
  );
}

/** Drapes that gather to either side, like a stage curtain. */
function CurtainsScene({ open }: { open: boolean }) {
  const fold =
    "repeating-linear-gradient(90deg, oklch(0.93 0.03 20) 0, oklch(0.87 0.045 20) 16px, oklch(0.96 0.022 25) 32px, oklch(0.9 0.035 20) 48px)";
  const drape = (side: "l" | "r") => {
    const left = side === "l";
    return (
      <div
        className="absolute inset-y-0"
        style={{
          ...(left ? { left: 0 } : { right: 0 }),
          width: "52%",
          background: fold,
          transformOrigin: left ? "left center" : "right center",
          transform: `scaleX(${open ? 0.2 : 1})`,
          transition: `transform 1350ms ${EASE} 300ms`,
          boxShadow: `inset ${left ? "-" : ""}14px 0 28px -16px oklch(0.3 0.05 10 / 0.45)`,
        }}
      />
    );
  };

  return (
    <div className="absolute inset-0">
      {/* What the curtains reveal. */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "9vh" }}>
        <OpeningMark variant="arch" />
      </div>
      {drape("l")}
      {drape("r")}
      {/* The rod. */}
      <div
        className="absolute inset-x-0 top-0 h-3"
        style={{ background: `linear-gradient(180deg, ${FOIL}, oklch(0.62 0.08 65))`, boxShadow: "0 4px 10px -4px oklch(0.3 0.05 10 / 0.5)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: open ? 0 : 1, transition: "opacity 350ms ease" }}
      >
        <p className={CAPS} style={{ color: INK }}>
          The wedding of
        </p>
        <p className="mt-4 leading-none" style={{ fontFamily: SCRIPT, color: INK, fontSize: "clamp(3rem, 15vw, 3.8rem)" }}>
          {COUPLE.bride}
        </p>
        <p className="my-1 font-display text-[1.4rem] text-bronze italic">&amp;</p>
        <p className="leading-none" style={{ fontFamily: SCRIPT, color: INK, fontSize: "clamp(3rem, 15vw, 3.8rem)" }}>
          {COUPLE.groom}
        </p>
        <Rule className="mt-6" />
        <p className={`${CAPS} mt-4`} style={{ color: INK }}>
          26 · 11 · 2026
        </p>
      </div>
    </div>
  );
}

/** A closed invitation book whose cover swings open to the photograph. */
function BookScene({ open }: { open: boolean }) {
  const frame =
    "0 0 0 3px var(--pearl), 0 0 0 4px color-mix(in oklab, var(--gold) 80%, transparent), 0 14px 26px -16px oklch(0.3 0.04 20 / 0.5)";
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ perspective: "1700px", paddingBottom: "12vh" }}
    >
      <div
        className="relative w-[72%] max-w-[19rem]"
        style={{
          aspectRatio: "3 / 4.1",
          // Open, the book is two pages wide: shrink it to fit the screen and
          // slide it so the spine sits in the middle.
          transformOrigin: "left center",
          transform: open ? "translateX(50%) scale(0.62)" : "none",
          transition: `transform 1200ms ${EASE} 200ms`,
        }}
      >
        {/* The first page. */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-r-[8px] rounded-l-[2px] px-4 text-center"
          style={{
            background: "var(--pearl)",
            border: "1px solid color-mix(in oklab, var(--gold) 55%, transparent)",
            boxShadow: "0 24px 44px -22px oklch(0.25 0.05 10 / 0.6)",
          }}
        >
          <div className="w-[48%] overflow-hidden" style={{ aspectRatio: "3 / 4", borderRadius: "999px 999px 10px 10px", boxShadow: frame }}>
            <img src={couplePhoto} alt="" className="h-full w-full object-cover" style={{ objectPosition: "center 35%" }} />
          </div>
          <p className="mt-6 leading-none whitespace-nowrap" style={{ fontFamily: SCRIPT, color: INK, fontSize: "min(1.9rem, 8vw)" }}>
            {COUPLE.bride} &amp; {COUPLE.groom}
          </p>
          <p className="mt-2 font-body text-[0.46rem] font-medium tracking-[0.34em] uppercase text-muted-foreground">
            26 · 11 · 2026
          </p>
        </div>

        {/* The cover: rose on the outside, ivory within. */}
        <div
          className="absolute inset-0 z-10"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            transform: open ? "rotateY(-178deg)" : "none",
            transition: `transform 1200ms ${EASE} 200ms`,
          }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-r-[8px] rounded-l-[2px] text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: `linear-gradient(160deg, ${ROSE_LIGHT}, ${ROSE_DEEP})`,
              boxShadow: "0 24px 44px -22px oklch(0.25 0.05 10 / 0.65), inset 6px 0 10px -6px oklch(0.2 0.05 10 / 0.6)",
            }}
          >
            <span className="absolute inset-3 rounded-[6px]" style={{ border: `1px solid ${FOIL}`, opacity: 0.75 }} />
            <span className="absolute inset-[18px] rounded-[4px]" style={{ border: `1px solid ${FOIL}`, opacity: 0.35 }} />
            <p style={{ fontFamily: SCRIPT, color: FOIL, fontSize: "clamp(3.4rem, 16vw, 4.6rem)", lineHeight: 1 }}>
              R<span style={{ fontSize: "0.5em", margin: "0 0.1em" }}>&amp;</span>V
            </p>
            <Rule className="my-5" />
            <p className="font-body text-[0.5rem] font-medium tracking-[0.36em] uppercase" style={{ color: FOIL }}>
              {COUPLE.bride} &amp; {COUPLE.groom}
            </p>
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-l-[8px] rounded-r-[2px] px-6 text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "var(--pearl)",
              border: "1px solid color-mix(in oklab, var(--gold) 55%, transparent)",
            }}
          >
            <p className="font-display text-[0.95rem] leading-snug text-muted-foreground italic">
              With the blessings of our families, we joyfully invite you to the wedding of
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A banana leaf: a broad blade, its midrib and side veins, drawn in SVG. */
function Leaf({
  style,
  tone = "oklch(0.5 0.1 150)",
  vein = "oklch(0.72 0.09 140)",
}: {
  style: React.CSSProperties;
  tone?: string;
  vein?: string;
}) {
  // Half the blade's height at x, so the veins stop at the leaf's edge.
  const half = (x: number) => 38 * Math.sin((Math.PI * x) / 200);
  const veins = Array.from({ length: 11 }, (_, i) => {
    const x0 = 14 + i * 16.5;
    const x1 = x0 + 15;
    const h = half(x1) * 0.9;
    return `M${x0} 45 L${x1} ${45 - h} M${x0} 45 L${x1} ${45 + h}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 200 90" aria-hidden="true" className="absolute" style={style}>
      <path d="M0 45 C40 -4 150 -2 200 45 C150 92 40 94 0 45Z" fill={tone} />
      <path d={veins} stroke={vein} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M0 45 L196 45" stroke={vein} strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

/** A muggu (rangoli) in white line: lotus rosettes, a ring of dots and side motifs. */
function Muggu() {
  const ring = (r: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return <circle key={`${r}-${i}`} cx={180 + r * Math.cos(a)} cy={110 + r * Math.sin(a)} r="1.7" />;
    });
  const petals = (cy: number, rx: number, ry: number, n: number, cx = 180, cyc = 110) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse key={`${cy}-${i}`} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${(i * 360) / n} ${cx} ${cyc})`} />
    ));
  const rosette = (cx: number, cy: number, s: number) =>
    Array.from({ length: 6 }, (_, i) => (
      <ellipse key={`r${cx}-${i}`} cx={cx} cy={cy - 9 * s} rx={4.4 * s} ry={9 * s} transform={`rotate(${i * 60} ${cx} ${cy})`} />
    ));
  return (
    <svg viewBox="0 0 360 220" aria-hidden="true" className="w-full">
      <g fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.92">
        {petals(110 - 48, 13, 25, 8)}
        {petals(110 - 24, 7, 14, 8)}
        <circle cx="180" cy="110" r="7" />
        <circle cx="180" cy="110" r="66" strokeDasharray="1 6" />
        {rosette(52, 110, 1.6)}
        {rosette(308, 110, 1.6)}
        <circle cx="52" cy="110" r="5" />
        <circle cx="308" cy="110" r="5" />
        <path d="M70 110 C98 86 110 86 128 110 C110 134 98 134 70 110Z" />
        <path d="M290 110 C262 86 250 86 232 110 C250 134 262 134 290 110Z" />
      </g>
      <g fill="white" opacity="0.95">
        {ring(78, 28)}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={`t${i}`} cx={120 + i * 30} cy="22" r="1.7" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={`b${i}`} cx={120 + i * 30} cy="198" r="1.7" />
        ))}
      </g>
    </svg>
  );
}

/** A brass lamp with a flickering flame, and a few jasmine flowers beside it. */
function Diya() {
  const jasmine = (cx: number, cy: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <ellipse key={`${cx}-${i}`} cx={cx} cy={cy - 4.5} rx="2.6" ry="4.6" transform={`rotate(${i * 72} ${cx} ${cy})`} fill="white" />
    ));
  return (
    <svg viewBox="0 0 110 64" aria-hidden="true" className="absolute" style={{ left: "5%", bottom: "17.5%", width: "26%" }}>
      <defs>
        <radialGradient id="rv-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="oklch(0.9 0.14 85)" stopOpacity="0.7" />
          <stop offset="1" stopColor="oklch(0.9 0.14 85)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rv-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.86 0.1 85)" />
          <stop offset="1" stopColor="oklch(0.6 0.1 65)" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="22" r="26" fill="url(#rv-glow)" />
      <path d="M10 34 Q32 58 54 34 Z" fill="url(#rv-brass)" />
      <path d="M24 50 h16 l2 8 h-20z" fill="url(#rv-brass)" />
      <g className="rv-flame" style={{ transformOrigin: "32px 34px" }}>
        <path d="M32 8 C24 18 26 30 32 33 C38 30 40 18 32 8Z" fill="oklch(0.82 0.16 65)" />
        <path d="M32 18 C29 23 30 29 32 31 C34 29 35 23 32 18Z" fill="oklch(0.95 0.1 90)" />
      </g>
      {jasmine(78, 52)}
      {jasmine(92, 44)}
      {jasmine(88, 57)}
      {jasmine(100, 54)}
    </svg>
  );
}

/** Falling marigold petals: a fixed handful, each on its own slow drift. */
function Petals() {
  const petals = Array.from({ length: 18 }, (_, i) => {
    const size = 9 + ((i * 5) % 4) * 4;
    return {
      left: `${(i * 37 + 8) % 96}%`,
      size,
      delay: -((i * 1.9) % 12),
      dur: 9 + ((i * 7) % 5) * 1.8,
      hue: i % 3 === 0 ? "oklch(0.84 0.15 90)" : i % 3 === 1 ? "oklch(0.76 0.17 65)" : "oklch(0.7 0.17 50)",
    };
  });
  return (
    <>
      <style>{`
        @keyframes rv-petal {
          0% { transform: translate3d(0,-10vh,0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          50% { transform: translate3d(26px,48vh,0) rotate(200deg); }
          100% { transform: translate3d(-20px,112vh,0) rotate(400deg); opacity: 1; }
        }
        @keyframes rv-flame { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(0.93, 1.08); } }
        .rv-petal { animation: rv-petal linear infinite; }
        .rv-flame { animation: rv-flame 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .rv-petal { display: none; } .rv-flame { animation: none; } }
      `}</style>
      {petals.map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="rv-petal pointer-events-none absolute top-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.25,
            borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%",
            background: `radial-gradient(circle at 40% 35%, oklch(0.95 0.08 90), ${p.hue})`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}

/** A peach courtyard: banana leaves, a muggu, a lamp, petals drifting down. */
function GardenScene({ open }: { open: boolean }) {
  const away = (dx: string) => ({
    transform: open ? `translateX(${dx})` : "none",
    opacity: open ? 0 : 1,
    transition: `transform 1000ms ${EASE}, opacity 800ms ease`,
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, oklch(0.93 0.034 60) 0%, oklch(0.91 0.04 50) 55%, oklch(0.89 0.05 42) 100%)" }}
      />

      {/* Banana leaves, spilling in from the top corners. */}
      <div className="absolute inset-0" style={away("-24%")}>
        <Leaf style={{ left: "-26%", top: "-4%", width: "78%", transform: "rotate(-34deg)" }} />
        <Leaf
          style={{ left: "-16%", top: "6%", width: "60%", transform: "rotate(-10deg)" }}
          tone="oklch(0.57 0.11 145)"
        />
      </div>
      <div className="absolute inset-0" style={away("24%")}>
        <Leaf
          style={{ right: "-28%", top: "-3%", width: "74%", transform: "scaleX(-1) rotate(-30deg)" }}
          tone="oklch(0.54 0.1 148)"
        />
      </div>

      {/* The muggu, drawn on the floor. */}
      <div
        className="absolute inset-x-0 mx-auto w-[92%] max-w-[26rem]"
        style={{
          bottom: "15%",
          opacity: open ? 0 : 0.95,
          transform: open ? "scale(1.06)" : "none",
          transition: "opacity 800ms ease, transform 1000ms ease",
        }}
      >
        <Muggu />
      </div>

      <div style={away("-10%")}>
        <Diya />
      </div>

      {/* Petals drift behind the words, never across them. */}
      <Petals />

      {/* The words. */}
      <div
        className="absolute inset-x-0 px-6 text-center"
        style={{
          top: "27%",
          opacity: open ? 0 : 1,
          transform: open ? "translateY(-14px)" : "none",
          transition: "opacity 700ms ease, transform 900ms ease",
        }}
      >
        <p className={CAPS} style={{ color: "oklch(0.36 0.07 150)" }}>
          The wedding of
        </p>
        <p
          className="mt-3 leading-none whitespace-nowrap"
          style={{ fontFamily: SCRIPT, color: INK, fontSize: "min(3.1rem, calc((min(100vw, 26rem) - 3rem) / 7.6))" }}
        >
          {COUPLE.bride} &amp; {COUPLE.groom}
        </p>
        <Rule className="my-5" />
        <p className="font-body text-[0.6rem] font-semibold tracking-[0.36em] uppercase" style={{ color: "oklch(0.36 0.07 150)" }}>
          A beautiful beginning
        </p>
        <p className="mt-3 font-display text-[1rem] text-muted-foreground italic">26 November 2026</p>
      </div>
    </div>
  );
}

function OpeningScene({ variant, open }: { variant: SceneStyle; open: boolean }) {
  if (variant === "garden") return <GardenScene open={open} />;
  if (variant === "envelope") return <EnvelopeScene open={open} />;
  if (variant === "doors") return <DoorsScene open={open} />;
  if (variant === "curtains") return <CurtainsScene open={open} />;
  return <BookScene open={open} />;
}

/** The mark in the middle of the opening screen, replacing the old monogram. */
function OpeningMark({ variant }: { variant: Exclude<OpeningStyle, "current" | SceneStyle> }) {
  const pinyon = { fontFamily: "var(--font-monogram)", color: INK } as const;

  // The couple's own "Viru" logo, the names and the date beneath it.
  if (variant === "logo") {
    return (
      <div className="text-center" aria-label={`${COUPLE.bride} and ${COUPLE.groom}`}>
        <img
          src={viruLogo}
          alt="Viru"
          width={2000}
          height={1024}
          className="mx-auto h-auto w-[78%] max-w-[22rem]"
          style={{ filter: "drop-shadow(0 2px 10px oklch(0.4 0.08 10 / 0.18))" }}
        />
        <Rule className="mt-5 mb-5" />
        <p className={CAPS} style={{ color: INK }}>
          {COUPLE.bride} &amp; {COUPLE.groom}
        </p>
        <p className="mt-3 font-display text-[1rem] text-muted-foreground italic">26 November 2026</p>
      </div>
    );
  }

  // Save the date: the day itself, huge and light, the names beneath.
  if (variant === "date") {
    return (
      <div className="text-center" aria-label={`${COUPLE.bride} and ${COUPLE.groom}, 26 November 2026`}>
        <p className={CAPS} style={{ color: INK }}>
          Save the date
        </p>
        <p
          className="mt-3 leading-[0.85] font-light"
          style={{ fontFamily: "var(--font-display)", color: INK, fontSize: "clamp(7rem, 40vw, 10rem)" }}
        >
          26
        </p>
        <p className={`${CAPS} mt-2`} style={{ color: INK }}>
          November 2026
        </p>
        <Rule className="my-7" />
        <p className="leading-none" style={{ ...pinyon, fontSize: "clamp(2.2rem, 10vw, 2.8rem)" }}>
          {COUPLE.bride} &amp; {COUPLE.groom}
        </p>
      </div>
    );
  }

  // The family's own invitation wording, then the names.
  if (variant === "blessing") {
    return (
      <div className="px-9 text-center" aria-label={`${COUPLE.bride} weds ${COUPLE.groom}`}>
        <p className="mx-auto max-w-[17rem] font-display text-[1.05rem] leading-snug text-muted-foreground italic">
          With the blessings of our families, we joyfully invite you to the wedding of
        </p>
        <p className="mt-6 leading-none" style={{ ...pinyon, fontSize: "clamp(3.4rem, 17vw, 4.6rem)" }}>
          {COUPLE.bride}
        </p>
        <p className="my-1 font-script text-[1.5rem] text-bronze">weds</p>
        <p className="leading-none" style={{ ...pinyon, fontSize: "clamp(3.4rem, 17vw, 4.6rem)" }}>
          {COUPLE.groom}
        </p>
        <Rule className="mt-7 mb-4" />
        <p className={CAPS} style={{ color: INK }}>
          26 November 2026
        </p>
      </div>
    );
  }

  // Two interlocking rings, a nod to the rings in the photograph.
  if (variant === "rings") {
    return (
      <div className="text-center" aria-label={`${COUPLE.bride} and ${COUPLE.groom}`}>
        <svg viewBox="0 0 120 72" className="mx-auto w-44" aria-hidden="true">
          <circle cx="44" cy="36" r="26" fill="none" stroke="var(--gold)" strokeWidth="1.8" />
          <circle cx="76" cy="36" r="26" fill="none" stroke="var(--bronze)" strokeWidth="1.8" />
          <circle cx="44" cy="36" r="22.5" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.7" />
          <circle cx="76" cy="36" r="22.5" fill="none" stroke="var(--bronze)" strokeWidth="0.5" opacity="0.7" />
          <path d="M60 15.4a26 26 0 0 1 0 41.2" fill="none" stroke="var(--gold)" strokeWidth="1.8" />
        </svg>
        <p className="mt-8 leading-none" style={{ ...pinyon, fontSize: "clamp(2.4rem, 11vw, 3rem)" }}>
          {COUPLE.bride} &amp; {COUPLE.groom}
        </p>
        <Rule className="my-5" />
        <p className={CAPS} style={{ color: INK }}>
          Together with their families
        </p>
      </div>
    );
  }

  // Full photo: the stage photograph, sharp, the names laid over its foot.
  if (variant === "photo") {
    return (
      <div
        className="absolute inset-x-0 bottom-0 px-6 text-center text-white"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 11rem)" }}
        aria-label={`${COUPLE.bride} and ${COUPLE.groom}`}
      >
        <p className="font-body text-[0.58rem] font-medium tracking-[0.4em] uppercase opacity-85">The wedding of</p>
        <p
          className="mt-2 leading-none"
          style={{ fontFamily: "var(--font-monogram)", fontSize: "clamp(2.8rem, 13vw, 3.6rem)", textShadow: "0 2px 16px oklch(0.2 0.03 15 / 0.5)" }}
        >
          {COUPLE.bride} &amp; {COUPLE.groom}
        </p>
        <p className="mt-3 font-body text-[0.58rem] font-medium tracking-[0.36em] uppercase opacity-85">
          26 · 11 · 2026
        </p>
      </div>
    );
  }

  // Framed: stationery. A double-ruled card, the line, the names, the place.
  if (variant === "framed") {
    return (
      <div
        className="w-[80%] px-6 py-10 text-center"
        aria-label={`${COUPLE.bride} and ${COUPLE.groom}`}
        style={{
          background: "color-mix(in oklab, var(--pearl) 82%, transparent)",
          border: "1px solid color-mix(in oklab, var(--gold) 75%, transparent)",
          boxShadow:
            "inset 0 0 0 6px color-mix(in oklab, var(--pearl) 88%, transparent), inset 0 0 0 7px color-mix(in oklab, var(--gold) 45%, transparent), 0 22px 40px -24px oklch(0.3 0.04 20 / 0.5)",
        }}
      >
        <p className={CAPS} style={{ color: INK }}>
          The wedding of
        </p>
        <p
          className="mt-5 leading-none whitespace-nowrap"
          style={{ ...pinyon, fontSize: "min(2.5rem, calc((min(100vw, 26rem) * 0.8 - 4.5rem) / 7.4))" }}
        >
          {COUPLE.bride} &amp; {COUPLE.groom}
        </p>
        <Rule className="my-6" />
        <p className="font-display text-[1.05rem] text-ink-strong italic">Thursday, 26 November 2026</p>
        <p className="mt-2 font-body text-[0.52rem] font-medium tracking-[0.3em] uppercase text-muted-foreground">
          Jogulamba Ammavari Temple · Alampur
        </p>
      </div>
    );
  }

  // A calligraphic R & V, the names beneath in spaced capitals.
  if (variant === "script") {
    return (
      <div className="text-center" aria-label={`${COUPLE.bride} and ${COUPLE.groom}`}>
        {/* Sized to the screen: the V's long swash reaches well past its box. */}
        <p className="leading-none" style={{ ...pinyon, fontSize: "clamp(4.2rem, 24vw, 6.5rem)" }}>
          R<span style={{ fontSize: "0.5em", margin: "0 0.12em" }}>&amp;</span>V
        </p>
        <Rule className="mt-6 mb-6" />
        <p className={CAPS} style={{ color: INK }}>
          {COUPLE.bride} &amp; {COUPLE.groom}
        </p>
        <p className="mt-3 font-display text-[1rem] text-muted-foreground italic">26 November 2026</p>
      </div>
    );
  }

  // The two names stacked in large script, an ampersand between.
  if (variant === "names") {
    return (
      <div className="text-center" aria-label={`${COUPLE.bride} and ${COUPLE.groom}`}>
        <p className="leading-none" style={{ ...pinyon, fontSize: "clamp(3.6rem, 19vw, 5rem)" }}>
          {COUPLE.bride}
        </p>
        <p className="my-1 font-display text-[1.6rem] text-bronze italic">&amp;</p>
        <p className="leading-none" style={{ ...pinyon, fontSize: "clamp(3.6rem, 19vw, 5rem)" }}>
          {COUPLE.groom}
        </p>
        <Rule className="mt-7 mb-5" />
        <p className={CAPS} style={{ color: INK }}>
          Are getting married
        </p>
      </div>
    );
  }

  // The names in Telugu, English beneath.
  if (variant === "telugu") {
    const te = { fontFamily: '"Suravaram", serif', fontWeight: 400, color: INK } as const;
    return (
      <div className="text-center" lang="te" aria-label={`${COUPLE.bride} and ${COUPLE.groom}`}>
        <p className="leading-snug" style={{ ...te, fontSize: "clamp(3rem, 15vw, 4rem)" }}>
          రుత్విక
        </p>
        <p className="my-0.5 font-display text-[1.6rem] text-bronze italic">&amp;</p>
        <p className="leading-snug" style={{ ...te, fontSize: "clamp(3rem, 15vw, 4rem)" }}>
          వివేక్
        </p>
        <Rule className="mt-6 mb-5" />
        <p className={CAPS} style={{ color: INK }} lang="en">
          {COUPLE.bride} &amp; {COUPLE.groom}
        </p>
      </div>
    );
  }

  // Their photograph in a tall arch, the names beneath.
  if (variant === "arch") {
    return (
      <div className="text-center" aria-label={`${COUPLE.bride} and ${COUPLE.groom}`}>
        <div
          className="mx-auto w-[52%] overflow-hidden"
          style={{
            aspectRatio: "3 / 4",
            borderRadius: "999px 999px 18px 18px",
            boxShadow:
              "0 0 0 4px var(--pearl), 0 0 0 5px color-mix(in oklab, var(--gold) 80%, transparent), 0 0 0 10px color-mix(in oklab, var(--pearl) 60%, transparent), 0 0 0 11px color-mix(in oklab, var(--gold) 45%, transparent), 0 20px 36px -18px oklch(0.3 0.04 20 / 0.5)",
          }}
        >
          <img src={couplePhoto} alt="" className="h-full w-full object-cover" style={{ objectPosition: "center 35%" }} />
        </div>
        <p className="mt-8 leading-none" style={{ ...pinyon, fontSize: "clamp(2.4rem, 11vw, 3rem)" }}>
          {COUPLE.bride} &amp; {COUPLE.groom}
        </p>
        <p className={`${CAPS} mt-3`} style={{ color: INK }}>
          26 · 11 · 2026
        </p>
      </div>
    );
  }

  // A round seal: R & V inside a double gold ring, the names beneath.
  return (
    <div className="text-center" aria-label={`${COUPLE.bride} and ${COUPLE.groom}`}>
      <div
        className="mx-auto flex size-44 items-center justify-center rounded-full"
        style={{
          background: "color-mix(in oklab, var(--pearl) 80%, transparent)",
          boxShadow:
            "0 0 0 1px color-mix(in oklab, var(--gold) 85%, transparent), 0 0 0 7px color-mix(in oklab, var(--pearl) 60%, transparent), 0 0 0 8px color-mix(in oklab, var(--gold) 50%, transparent), 0 20px 36px -20px oklch(0.3 0.04 20 / 0.5)",
        }}
      >
        <p className="leading-none" style={{ ...pinyon, fontSize: "3.3rem" }}>
          R<span style={{ fontSize: "0.5em", margin: "0 0.1em" }}>&amp;</span>V
        </p>
      </div>
      <p className={`${CAPS} mt-9`} style={{ color: INK }}>
        {COUPLE.bride} &amp; {COUPLE.groom}
      </p>
      <Rule className="my-4" />
      <p className="font-display text-[1rem] text-muted-foreground italic">26 November 2026</p>
    </div>
  );
}

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
export function Envelope({
  onOpened,
  // The couple's "Viru" logo over the blurred stage photo. ("current" is the old
  // L&A monogram; the other designs are on /opening-preview.)
  variant = "logo",
  silent = false,
}: {
  onOpened: () => void;
  variant?: OpeningStyle;
  /** For previews: tapping plays the opening, but no music. */
  silent?: boolean;
}) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Get the song's player ready before the tap that has to start it.
  useEffect(() => {
    if (!silent) preloadMusic();
  }, [silent]);

  const open = () => {
    if (opening) return;
    setOpening(true);
    if (!silent) startMusic();
    // The animated scenes play out before the page takes over.
    timer.current = window.setTimeout(onOpened, isScene(variant) ? SCENE_MS : 80);
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
        style={
          // Full photo: no frost, just a shade at the foot for the white type.
          variant === "photo"
            ? { background: "linear-gradient(180deg, transparent 38%, oklch(0.2 0.03 15 / 0.72) 100%)" }
            : {
                backdropFilter: "blur(20px) saturate(0.85)",
                WebkitBackdropFilter: "blur(20px)",
                background: "color-mix(in oklab, var(--background) 68%, transparent)",
              }
        }
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
        {variant === "current" ? (
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
        ) : (
          isScene(variant) ? (
            <OpeningScene variant={variant} open={opening} />
          ) : (
            <OpeningMark variant={variant} />
          )
        )}
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
