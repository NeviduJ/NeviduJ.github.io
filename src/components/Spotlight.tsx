"use client";

import { useEffect, useRef } from "react";

// Tracks the cursor within its parent section, setting --spot-x/--spot-y/--spot on the
// parent so layers in the section (like the hero's outlined glyph) can react to it.
// The glow itself is site-wide; see CursorGlow.
export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = parent.getBoundingClientRect();
        parent.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
        parent.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
        parent.style.setProperty("--spot", "1");
      });
    };
    const leave = () => parent.style.setProperty("--spot", "0");

    parent.addEventListener("pointermove", move);
    parent.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      parent.removeEventListener("pointermove", move);
      parent.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="hidden" />;
}
