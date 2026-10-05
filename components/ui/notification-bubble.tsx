import React, { useEffect, useState } from "react";

import type { CSSProperties } from "react";

export type Position =
  "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";

interface NotificationProps {
  message: string;
  anchorRef?: React.RefObject<HTMLElement | null>;
  position?: Position;
  duration?: number;
  icon?: React.ReactNode;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  anchorRef,
  position = "bottom-right",
  duration = 3000,
  icon,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [positionStyle, setPositionStyle] = useState<CSSProperties>({
    right: "1.5rem",
    bottom: "1.5rem",
  });

  useEffect(() => {
    const anchor = anchorRef?.current;

    if (anchor) {
      const rect = anchor.getBoundingClientRect();

      switch (position) {
        case "top-left":
          setPositionStyle({
            left: `${rect.left}px`,
            top: `${rect.top - 12}px`,
            transform: "translateY(-100%)",
          });
          break;

        case "top-right":
          setPositionStyle({
            left: `${rect.right}px`,
            top: `${rect.top - 12}px`,
            transform: "translate(-100%, -100%)",
          });
          break;

        case "top-center":
          setPositionStyle({
            left: `${rect.left + rect.width / 2}px`,
            top: `${rect.top - 12}px`,
            transform: "translate(-50%, -100%)",
          });
          break;

        case "bottom-left":
          setPositionStyle({
            left: `${rect.left}px`,
            top: `${rect.bottom + 12}px`,
          });
          break;

        case "bottom-center":
          setPositionStyle({
            left: `${rect.left + rect.width / 2}px`,
            top: `${rect.bottom + 12}px`,
            transform: "translateX(-50%)",
          });
          break;

        case "bottom-right":
        default:
          setPositionStyle({
            left: `${rect.right}px`,
            top: `${rect.bottom + 12}px`,
            transform: "translateX(-100%)",
          });
          break;
      }
    } else {
      switch (position) {
        case "top-left":
          setPositionStyle({
            left: "1.5rem",
            top: "1.5rem",
          });
          break;

        case "top-right":
          setPositionStyle({
            right: "1.5rem",
            top: "1.5rem",
          });
          break;

        case "top-center":
          setPositionStyle({
            left: "50%",
            top: "1.5rem",
            transform: "translateX(-50%)",
          });
          break;

        case "bottom-left":
          setPositionStyle({
            left: "1.5rem",
            bottom: "1.5rem",
          });
          break;

        case "bottom-center":
          setPositionStyle({
            left: "50%",
            bottom: "1.5rem",
            transform: "translateX(-50%)",
          });
          break;

        case "bottom-right":
        default:
          setPositionStyle({
            right: "1.5rem",
            bottom: "1.5rem",
          });
          break;
      }
    }

    const timer = window.setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [anchorRef, position, duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-10000 flex max-w-[calc(100vw-2rem)] items-center gap-3 resume-surface rounded-xl border border-(--site-surface-border) px-4 py-3 text-sm font-medium text-(--site-text) shadow-xl backdrop-blur-md"
      style={positionStyle}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--site-accent)/15 site-nav-active"
        aria-hidden="true"
      >
        {icon ?? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>

      <span className="leading-5">{message}</span>
    </div>
  );
};
