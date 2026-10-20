"use client";

import Particles from "@/components/layouts/particles";

const shuttles = Array.from({ length: 8 }, (_, i) => i);

export default function SiteBackground() {
  return (
    <div
      className="site-background pointer-events-none fixed inset-0 isolate z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 signal-grid opacity-40" />

      <div className="shuttle-field absolute inset-0">
        {shuttles.map((shuttle) => (
          <span
            key={shuttle}
            className="shuttle"
            style={{
              top: `${10 + shuttle * 11}%`,
              animationDelay: `${shuttle * -1.8}s`,
              animationDuration: `${7 + (shuttle % 3) * 2}s`,
            }}
          />
        ))}
      </div>

      <Particles className="absolute inset-0 z-0 opacity-80" quantity={150} />
    </div>
  );
}
