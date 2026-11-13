# Ruthvika & Vivek — wedding invitation

An interactive wedding invitation: a pleated envelope that opens into a
scroll-driven single page covering the couple's story, the three days of
celebrations, and an RSVP.

Built with **TanStack Start** (React 19 + SSR), **TypeScript** and
**Tailwind CSS v4**.

---

## Getting it running

### 1. Prerequisites

**Node.js 22.12 or newer.** TanStack Start requires it — older versions fail
with confusing module errors rather than a clear message, so check first:

```sh
node -v
```

If you need to install or upgrade, [nvm](https://github.com/nvm-sh/nvm) is the
easiest route:

```sh
nvm install 22
nvm use 22
```

npm ships with Node, so there is nothing else to install.

### 2. Clone and enter the project

The repository root contains the project in a sub-folder, and **that folder name
has spaces in it** — quote the path or your shell will split it:

```sh
git clone https://github.com/SANJANAAVEESAM/Ruthvika-and-Vivek.git
cd Ruthvika-and-Vivek/"Elegant Invitation Journey"
```

### 3. Install

```sh
npm install
```

This uses the committed `package-lock.json`. Please don't switch package
managers — a stray `bun.lock` or `yarn.lock` will cause everyone else's installs
to drift.

### 4. Run it

```sh
npm run dev
```

Open **http://localhost:8080**.

The first load compiles routes on demand and can take a few seconds; after that
edits hot-reload instantly.

---

## Viewing it on your phone

This is a mobile-first design and genuinely looks different on a phone — the
opening screen, the pinned scroll sections and the safe-area padding are all
tuned for it. Desktop is the secondary case.

The dev server already listens on every network interface, so with your phone on
the same Wi-Fi, look for the `Network:` line printed on startup:

```
➜  Local:    http://localhost:8080/
➜  Network:  http://192.168.x.x:8080/   ← open this on your phone
```

The music plays through YouTube's embedded player, so the phone needs internet.
Which song, and where it starts, are set at the top of `src/lib/music.ts`.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 8080 with hot reload |
| `npm run build` | Production build into `.output/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier over the whole project |

**Please run `npm run build` before pushing.** Type errors surface there that
the dev server happily ignores, and the build is fast (about a second).

---

## Where things live

```
src/
├── routes/
│   ├── __root.tsx          App shell: fonts, meta tags, og:image
│   └── index.tsx           Opening screen → microsite handoff
├── components/wedding/
│   ├── data.ts             ★ All content: names, dates, events, contact
│   ├── Envelope.tsx        Opening screen (pleats, medallion, parting)
│   ├── Microsite.tsx       The scrolling page — every section lives here
│   ├── Hero.tsx            Photo card that collapses as you scroll
│   ├── ScrollReveal.tsx    "you're cordially invited…" inking in
│   ├── Confetti.tsx        Two poppers on the join-us screen
│   └── …                   Countdown, Modal, FloatingNav, AddToCalendar
├── components/ui/          shadcn/ui primitives (mostly unused)
├── lib/                    Calendar (.ics + Google), music, error handling
└── styles.css              ★ Design tokens and utilities
```

The two starred files are where almost all edits belong.

### Editing content

**`src/components/wedding/data.ts` holds everything a non-developer would want
to change** — the couple's names, the year, every event with its theme, timing
and dress code, the WhatsApp number, and the contact email. You rarely need to
touch a component to change what the page says.

The wedding year is defined **once**, as `WEDDING_YEAR`. The countdown, calendar
files and every displayed date derive from it, so changing that one line moves
the whole site.

### Editing design

Colours, fonts, shadows and custom utilities live in `src/styles.css`. There is
**no `tailwind.config.js`** — Tailwind v4 reads its theme from CSS. Tokens are
declared under `:root` and exposed to utilities via `@theme inline`.

All colours use `oklch()`. Please keep it that way; mixing in hex makes the
palette impossible to adjust coherently.

---

## Conventions worth knowing

**Routing is file-based.** Every file in `src/routes/` is a route. Don't add
`src/pages/` or `app/layout.tsx` — those belong to other frameworks.
`routeTree.gen.ts` is generated; never edit it by hand.

**Motion is hand-rolled.** No GSAP, Lenis or Framer Motion. Scroll effects use a
small `useScrollProgress` hook (a passive listener plus `requestAnimationFrame`)
and CSS transitions. This keeps the bundle small and avoids fighting SSR. Please
don't add an animation library without discussing it first.

**Everything honours `prefers-reduced-motion`.** If you add motion, add the
guard too.

**Careful with Tailwind translate utilities.** Tailwind v4 emits `translate` as
its own CSS property, which *composes with* `transform` rather than being
overridden by it. Putting `-translate-x-1/2` on an element that also has an
inline `transform` will double the shift. Centre with flexbox instead.

---

## Not yet filled in

Search the codebase for `TODO(` to find these:

- **RSVPs** — they are saved to a Google Sheet through an Apps Script. Until
  `RSVP_WEBHOOK_URL` is set, the form falls back to a ready-written WhatsApp
  message to Sunny. Setup is in `docs/rsvp-setup.md`.
- **`TODO(domain)`** — `SITE_URL` in `src/components/wedding/data.ts` is empty.
  Set it to the live address so the link preview (`public/share.jpg`) shows
  when the link is shared.
- **`TODO(live)`** — each event's `liveUrl` in `data.ts`. Until one is added,
  its row under "Live links" reads "Link coming soon".
- **Contact email** — `CONTACT_EMAIL` in `data.ts` is empty, so the contact
  sheet shows only the two phone numbers.

---

## Deploying

`npm run build` produces `.output/`, ready to run with Node:

```sh
node .output/server/index.mjs
```

Nitro builds for Node by default. For another host, set a preset in
`vite.config.ts`:

```ts
nitro({ preset: "vercel" })   // or "cloudflare-module", "netlify", …
```

---

## Contributing

Branch off `main`, keep commits focused, and make sure `npm run build` passes
before opening a PR. If you change anything under `src/components/wedding/`,
please check it on a phone as well as a desktop window — several sections are
sized against viewport height and behave differently at each.
