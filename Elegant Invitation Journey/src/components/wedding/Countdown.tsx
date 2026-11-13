import { useEffect, useState } from "react";
import { WEDDING_DATE } from "./data";

function diff() {
  const ms = Math.max(0, WEDDING_DATE.getTime() - Date.now());
  return {
    Days: Math.floor(ms / 86400000),
    Hours: Math.floor(ms / 3600000) % 24,
    Minutes: Math.floor(ms / 60000) % 60,
    Seconds: Math.floor(ms / 1000) % 60,
  };
}

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

export type CountdownStyle =
  | "plain" | "tiles" | "ring" | "light" | "flip" | "dials" | "telugu" | "sentence"
  | "hairline" | "roman" | "editorial" | "engraved";

/** 12 → "XII"; nothing left reads as a dash. */
function roman(n: number | undefined): string {
  if (n === undefined) return "—";
  if (!n) return "—";
  const map: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let s = "";
  for (const [v, r] of map) while (n >= v) { s += r; n -= v; }
  return s;
}

/** Gold-foil lettering, for the engraved look. */
const FOIL_TEXT: React.CSSProperties = {
  background:
    "linear-gradient(100deg, oklch(0.42 0.09 65) 0%, oklch(0.68 0.12 82) 22%, oklch(0.48 0.1 68) 45%, oklch(0.7 0.11 84) 65%, oklch(0.44 0.09 66) 85%, oklch(0.62 0.11 78) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const TELUGU: Record<(typeof UNITS)[number], string> = {
  Days: "రోజులు",
  Hours: "గంటలు",
  Minutes: "నిమిషాలు",
  Seconds: "సెకన్లు",
};
/** What a full ring means, per unit — a month of days, a day of hours, and so on. */
const FULL = { Days: 30, Hours: 24, Minutes: 60, Seconds: 60 } as const;

function useCountdown() {
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);
  useEffect(() => {
    setT(diff());
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const two = (n: number | undefined) => (n === undefined ? "--" : String(n).padStart(2, "0"));

/**
 * The live countdown to the Muhurtham.
 *  - plain: big serif numerals, hairline labels, no boxes (the original)
 *  - light: the same, in ivory, for a dark band
 *  - tiles: each unit in its own soft rose tile
 *  - ring:  the days large inside a gold ring, the rest on one line beneath
 */
export function Countdown({ variant = "plain" }: { variant?: CountdownStyle }) {
  const t = useCountdown();

  if (variant === "tiles") {
    return (
      <div className="flex justify-center gap-2.5">
        {UNITS.map((k) => (
          <div
            key={k}
            className="flex w-[4.1rem] flex-col items-center rounded-2xl py-3"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--bronze) 8%, var(--pearl)), color-mix(in oklab, var(--bronze) 16%, var(--pearl)))",
              border: "1px solid color-mix(in oklab, var(--bronze) 30%, var(--gold))",
              boxShadow: "0 8px 18px -12px color-mix(in oklab, var(--bronze) 70%, transparent)",
            }}
          >
            <span className="font-display text-[1.9rem] leading-none text-ink-strong lining-nums tabular-nums">{two(t?.[k])}</span>
            <span className="mt-1.5 font-body text-[0.44rem] font-semibold tracking-[0.22em] uppercase text-bronze-deep">
              {k}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "ring") {
    return (
      <div className="flex flex-col items-center">
        <div
          className="flex size-36 flex-col items-center justify-center rounded-full"
          style={{
            background: "color-mix(in oklab, var(--pearl) 85%, transparent)",
            boxShadow:
              "0 0 0 1px color-mix(in oklab, var(--gold) 80%, transparent), 0 0 0 6px color-mix(in oklab, var(--pearl) 70%, transparent), 0 0 0 7px color-mix(in oklab, var(--gold) 45%, transparent), 0 16px 30px -18px oklch(0.3 0.04 20 / 0.5)",
          }}
        >
          <span className="font-display text-[3.4rem] leading-none font-light text-bronze-deep lining-nums tabular-nums">
            {t ? t.Days : "--"}
          </span>
          <span className="mt-1 font-body text-[0.5rem] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
            days to go
          </span>
        </div>
        <p className="mt-5 font-display text-[1.15rem] text-ink-strong lining-nums tabular-nums">
          {two(t?.Hours)}
          <span className="mx-1 font-body text-[0.55rem] tracking-[0.2em] text-muted-foreground uppercase">h</span>
          {two(t?.Minutes)}
          <span className="mx-1 font-body text-[0.55rem] tracking-[0.2em] text-muted-foreground uppercase">m</span>
          {two(t?.Seconds)}
          <span className="ml-1 font-body text-[0.55rem] tracking-[0.2em] text-muted-foreground uppercase">s</span>
        </p>
      </div>
    );
  }

  // Hairline: light numerals in columns divided by fine gold rules.
  if (variant === "hairline") {
    return (
      <div className="flex justify-center">
        {UNITS.map((k, i) => (
          <div
            key={k}
            className="flex w-[4.4rem] flex-col items-center py-1"
            style={{ borderLeft: i === 0 ? "none" : "1px solid color-mix(in oklab, var(--gold) 55%, transparent)" }}
          >
            <span className="font-display text-[2.6rem] leading-none font-light text-ink-strong lining-nums tabular-nums">{two(t?.[k])}</span>
            <span className="mt-2.5 font-body text-[0.46rem] font-medium tracking-[0.3em] uppercase text-muted-foreground">{k}</span>
          </div>
        ))}
      </div>
    );
  }

  // Roman numerals, small italic labels, little diamonds between.
  if (variant === "roman") {
    return (
      <div className="flex items-start justify-center gap-2.5">
        {UNITS.map((k, i) => (
          <div key={k} className="flex items-start gap-2.5">
            {i > 0 && <span aria-hidden="true" className="mt-[0.95rem] size-1 rotate-45" style={{ background: "var(--gold)" }} />}
            <div className="flex min-w-[3.2rem] flex-col items-center">
              <span className="font-display text-[1.7rem] leading-none tracking-[0.06em] text-ink-strong whitespace-nowrap">{roman(t?.[k])}</span>
              <span className="mt-2 font-display text-[0.8rem] text-muted-foreground italic">{k.toLowerCase()}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Editorial: the days huge and light, everything else a quiet line beneath.
  if (variant === "editorial") {
    return (
      <div className="text-center">
        <p className="font-display text-[5.2rem] leading-[0.82] font-light text-bronze-deep lining-nums tabular-nums">{t ? t.Days : "--"}</p>
        <p className="mt-1.5 font-body text-[0.58rem] font-medium tracking-[0.4em] uppercase text-ink-strong">days to go</p>
        <span aria-hidden="true" className="mx-auto mt-3 mb-2.5 block h-px w-12" style={{ background: "var(--gold)" }} />
        <p className="font-display text-[1.1rem] leading-tight text-muted-foreground italic lining-nums tabular-nums">
          {two(t?.Hours)} hours · {two(t?.Minutes)} minutes · {two(t?.Seconds)} seconds
        </p>
      </div>
    );
  }

  // Engraved: gold-foil numerals between two fine gold rules.
  if (variant === "engraved") {
    return (
      <div className="mx-auto max-w-[21rem]">
        <span aria-hidden="true" className="block h-px w-full" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
        <div className="flex justify-center gap-4 py-5">
          {UNITS.map((k) => (
            <div key={k} className="flex min-w-[3rem] flex-col items-center">
              <span className="font-display text-[2.4rem] leading-none font-semibold lining-nums tabular-nums" style={FOIL_TEXT}>{two(t?.[k])}</span>
              <span className="mt-2 font-display text-[0.82rem] text-muted-foreground italic">{k.toLowerCase()}</span>
            </div>
          ))}
        </div>
        <span aria-hidden="true" className="block h-px w-full" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
      </div>
    );
  }

  // Flip-clock cards: ivory numerals on rose, split by a fine line.
  if (variant === "flip") {
    return (
      <div className="flex justify-center gap-2.5">
        {UNITS.map((k) => (
          <div key={k} className="flex flex-col items-center">
            <div
              className="relative flex h-[4.6rem] w-[3.9rem] items-center justify-center overflow-hidden rounded-[10px]"
              style={{
                background: "linear-gradient(180deg, oklch(0.56 0.08 12) 0%, oklch(0.5 0.08 10) 50%, oklch(0.46 0.08 9) 50%, oklch(0.42 0.08 8) 100%)",
                boxShadow: "0 12px 22px -14px oklch(0.3 0.06 10 / 0.7)",
              }}
            >
              <span className="font-display text-[2.4rem] leading-none text-[oklch(0.98_0.01_40)] lining-nums tabular-nums">{two(t?.[k])}</span>
              <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px" style={{ background: "oklch(0.3 0.05 10 / 0.6)" }} />
              <span aria-hidden="true" className="absolute top-1/2 -left-[3px] size-1.5 -translate-y-1/2 rounded-full" style={{ background: "var(--pearl)" }} />
              <span aria-hidden="true" className="absolute top-1/2 -right-[3px] size-1.5 -translate-y-1/2 rounded-full" style={{ background: "var(--pearl)" }} />
            </div>
            <span className="mt-2 font-body text-[0.46rem] font-semibold tracking-[0.24em] uppercase text-bronze-deep">{k}</span>
          </div>
        ))}
      </div>
    );
  }

  // Four slim dials, each filling as its unit counts.
  if (variant === "dials") {
    const R = 27;
    const C = 2 * Math.PI * R;
    return (
      <div className="flex justify-center gap-3">
        {UNITS.map((k) => {
          const v = t?.[k] ?? 0;
          const frac = Math.min(1, v / FULL[k]);
          return (
            <div key={k} className="flex flex-col items-center">
              <div className="relative size-[4.3rem]">
                <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden="true">
                  <circle cx="32" cy="32" r={R} fill="color-mix(in oklab, var(--pearl) 80%, transparent)" stroke="color-mix(in oklab, var(--gold) 35%, transparent)" strokeWidth="2" />
                  <circle cx="32" cy="32" r={R} fill="none" stroke="var(--bronze)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-display text-[1.5rem] text-ink-strong lining-nums tabular-nums">{two(t?.[k])}</span>
              </div>
              <span className="mt-2 font-body text-[0.46rem] font-semibold tracking-[0.22em] uppercase text-muted-foreground">{k}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // The same plain numerals, labelled in Telugu.
  if (variant === "telugu") {
    return (
      <div className="flex items-start justify-center">
        {UNITS.map((k, i) => (
          <div key={k} className="flex items-start">
            {i > 0 && <span className="mx-1 pt-0.5 font-display text-2xl text-[var(--gold)]" aria-hidden="true">:</span>}
            <div className="flex min-w-[3.4rem] flex-col items-center">
              <span className="font-display text-[2.1rem] leading-none text-foreground lining-nums tabular-nums">{two(t?.[k])}</span>
              <span lang="te" className="mt-1.5 text-[0.8rem] text-bronze-deep" style={{ fontFamily: '"Suravaram", serif', fontWeight: 400 }}>
                {TELUGU[k]}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // A sentence: "12 days, 16 hours and 7 minutes to go".
  if (variant === "sentence") {
    return (
      <p className="mx-auto max-w-[22rem] font-display text-[1.2rem] leading-[1.25] text-ink-strong">
        <span className="whitespace-nowrap">
          <span className="font-script text-[2.1rem] text-bronze">{t ? t.Days : "--"}</span> days,{" "}
          <span className="font-script text-[2.1rem] text-bronze">{t ? t.Hours : "--"}</span> hours
        </span>
        <br />
        <span className="whitespace-nowrap">
          and <span className="font-script text-[2.1rem] text-bronze">{t ? t.Minutes : "--"}</span> minutes to go
        </span>
      </p>
    );
  }

  const light = variant === "light";
  return (
    <div className="flex items-start justify-center">
      {UNITS.map((k, i) => (
        <div key={k} className="flex items-start">
          {i > 0 && (
            <span
              className="mx-1 pt-0.5 font-display text-2xl sm:mx-2"
              style={{ color: light ? "oklch(0.86 0.06 70)" : "var(--gold)" }}
              aria-hidden="true"
            >
              :
            </span>
          )}
          <div className="flex min-w-[3.2rem] flex-col items-center">
            <span
              className="font-display text-[2.1rem] leading-none lining-nums tabular-nums sm:text-4xl"
              style={{ color: light ? "oklch(0.98 0.01 40)" : "var(--foreground)" }}
            >
              {two(t?.[k])}
            </span>
            <span
              className="mt-2 font-body text-[0.46rem] font-medium tracking-[0.24em] uppercase"
              style={{ color: light ? "oklch(0.9 0.03 40)" : "var(--muted-foreground)" }}
            >
              {k}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
