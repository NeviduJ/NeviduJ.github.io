"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ScriptVariant = { text: string; font: "font-sinhala" | "font-tamil" };

const STAGE_MS = 1100;

// Shows the word in each script in turn (e.g. Sinhala, then Tamil) before settling on English
export default function ScriptMorph({
  text,
  variants,
  className,
  delay = 0,
}: {
  text: string;
  variants: ScriptVariant[];
  className?: string;
  delay?: number;
}) {
  // Start on the first script so the server render matches and English never flashes first
  const [stage, setStage] = useState(0);
  const done = stage >= variants.length;
  const current = done ? null : variants[stage];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(variants.length);
      return;
    }
    const timers = variants.map((_, i) =>
      setTimeout(() => setStage(i + 1), delay + STAGE_MS * (i + 1))
    );
    return () => timers.forEach(clearTimeout);
  }, [variants, delay]);

  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <span className="sr-only">{text}</span>
      {/* English always holds the layout; it fades in once the other scripts have played */}
      <motion.span
        aria-hidden="true"
        className="inline-block"
        initial={false}
        animate={done ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(12px)", y: "0.08em" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {text}
      </motion.span>
      <AnimatePresence>
        {current && (
          <motion.span
            key={stage}
            aria-hidden="true"
            className={`absolute inset-0 flex items-center whitespace-nowrap not-italic text-accent text-[0.55em] ${current.font}`}
            initial={{ opacity: 0, filter: "blur(10px)", y: "0.15em" }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(10px)", y: "-0.15em" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {current.text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
