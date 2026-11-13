import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SITE_URL } from "@/components/wedding/data";
import { Envelope } from "@/components/wedding/Envelope";
import { Microsite } from "@/components/wedding/Microsite";

const TITLE = "Ruthvika weds Vivek — 26 November 2026";
const DESCRIPTION =
  "With the blessings of our families, we joyfully invite you to the wedding of Ruthvika & Vivek — 26 November 2026, Jogulamba Ammavari Temple, Alampur.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  // The microsite renders beneath the envelope from the start, so the opening
  // dissolves straight into the hero rather than cutting to it.
  const [revealed, setRevealed] = useState(false);
  const [overlayGone, setOverlayGone] = useState(false);

  // No scrolling until the hero is revealed.
  useEffect(() => {
    if (overlayGone) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      el.style.overflow = prev;
    };
  }, [overlayGone]);

  const handleOpened = () => {
    setRevealed(true);
    window.setTimeout(() => setOverlayGone(true), 500);
  };

  return (
    <>
      <Microsite live={revealed} />
      {!overlayGone && (
        <div
          className="fixed inset-0 z-50"
          style={{ transition: "opacity 450ms ease", opacity: revealed ? 0 : 1 }}
        >
          <Envelope onOpened={handleOpened} />
        </div>
      )}
    </>
  );
}
