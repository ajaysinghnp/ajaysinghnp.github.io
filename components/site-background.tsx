"use client";

import Particles from "@/components/particles";

export default function SiteBackground() {
  return (
    <div className="site-background pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 signal-grid opacity-40" />
      <div className="shuttle-field absolute inset-0" />
      <Particles className="z-0 opacity-80" quantity={150} />
    </div>
  );
}
