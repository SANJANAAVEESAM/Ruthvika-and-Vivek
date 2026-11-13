import { createServerFn } from "@tanstack/react-start";

/**
 * Recording an RSVP.
 *
 * This runs on the server, not in the guest's browser, for two reasons: the
 * webhook URL stays out of the page source where anyone could post junk to it,
 * and a same-origin call sidesteps CORS entirely — Apps Script will not answer
 * a cross-origin POST in a way the browser lets us read, so a direct call from
 * the page could never tell the guest whether it actually worked.
 */
export type RsvpPayload = {
  firstName: string;
  lastName: string;
  attending: "yes" | "no";
  /** 1–9, and only meaningful when attending. */
  guests: number;
  travellingFrom: string;
  /** Event names, already resolved from slugs for a readable sheet. */
  events: string[];
  note: string;
};

export type RsvpResult =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "rejected" | "unreachable" };

const isPayload = (v: unknown): v is RsvpPayload => {
  if (typeof v !== "object" || v === null) return false;
  const d = v as Record<string, unknown>;
  return (
    typeof d.firstName === "string" &&
    typeof d.lastName === "string" &&
    (d.attending === "yes" || d.attending === "no") &&
    typeof d.guests === "number" &&
    typeof d.travellingFrom === "string" &&
    Array.isArray(d.events) &&
    typeof d.note === "string"
  );
};

export const submitRsvp = createServerFn({ method: "POST" })
  .validator((data: unknown): RsvpPayload => {
    if (!isPayload(data)) throw new Error("Malformed RSVP");
    return {
      // Trimmed and bounded here rather than trusted from the client, since a
      // server function is a public endpoint like any other.
      firstName: data.firstName.trim().slice(0, 80),
      lastName: data.lastName.trim().slice(0, 80),
      attending: data.attending,
      guests: Math.min(9, Math.max(1, Math.round(data.guests) || 1)),
      travellingFrom: data.travellingFrom.trim().slice(0, 120),
      events: data.events.slice(0, 12).map((e) => String(e).slice(0, 60)),
      note: data.note.trim().slice(0, 1000),
    };
  })
  .handler(async ({ data }): Promise<RsvpResult> => {
    const endpoint = process.env.RSVP_WEBHOOK_URL;

    if (!endpoint) {
      // Loud on the server, honest to the guest — never a silent success, or
      // RSVPs would vanish with everyone believing they had arrived.
      console.error("[rsvp] RSVP_WEBHOOK_URL is not set; RSVP was not recorded:", data);
      return { ok: false, reason: "unconfigured" };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, receivedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(10_000),
      });

      // Apps Script answers 302 to a redirect target on success; fetch follows
      // it, so anything outside 2xx here is a real failure.
      if (!res.ok) {
        console.error("[rsvp] webhook rejected:", res.status, await res.text().catch(() => ""));
        return { ok: false, reason: "rejected" };
      }
      return { ok: true };
    } catch (err) {
      console.error("[rsvp] webhook unreachable:", err);
      return { ok: false, reason: "unreachable" };
    }
  });
