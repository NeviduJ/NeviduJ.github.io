"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Tokenized from "./Tokenized";
import { pseudoTokenize } from "@/lib/tokenize";
import {
  awardFor,
  formatPubDate,
  isMe,
  sortPublications,
  type Publication,
  type SortMode,
} from "@/lib/publications";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "year", label: "Year" },
  { value: "citations", label: "Citations" },
];

export default function Publications({
  publications,
  index = "02",
  initialCount,
}: {
  publications: Publication[];
  index?: string;
  /** Show only this many until "Show all" is clicked; omit to always show everything */
  initialCount?: number;
}) {
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const sorted = useMemo(() => sortPublications(publications, sortMode), [publications, sortMode]);
  const collapsible = initialCount !== undefined && sorted.length > initialCount;
  const visible = collapsible && !expanded ? sorted.slice(0, initialCount) : sorted;
  const maxCitations = Math.max(1, ...publications.map((p) => p.citation_count));

  return (
    <>
      <SectionHeading index={index} title="Publications" count={publications.length}>
        <div
          role="group"
          aria-label="Sort publications"
          className="inline-flex border border-line font-mono text-[11px] uppercase tracking-[0.15em]"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSortMode(option.value)}
              aria-pressed={sortMode === option.value}
              className={`px-4 py-2 transition-colors ${
                sortMode === option.value ? "bg-ink text-paper" : "text-muted hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </SectionHeading>

      <ol ref={listRef} className="scroll-mt-24">
        {visible.map((pub, index) => (
          <motion.li
            key={pub.title}
            layout
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04 }}
            className="group tok-group relative grid grid-cols-[2.5rem_1fr] gap-x-4 py-8 md:grid-cols-[4rem_1fr_7rem] md:gap-x-8"
          >
            <span className="flex flex-col gap-1 pt-2 font-mono text-xs text-muted transition-colors group-hover:text-accent">
              {String(index + 1).padStart(2, "0")}
              <span className="text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
                {pseudoTokenize(pub.title).length} tok
              </span>
            </span>

            <div className="min-w-0 space-y-3">
              <h3 className="font-serif text-2xl leading-tight md:text-3xl">
                {pub.url ? (
                  <a href={pub.url} target="_blank" rel="noopener noreferrer">
                    <Tokenized text={pub.title} />
                    <ArrowUpRight className="ml-1 inline h-5 w-5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                ) : (
                  <Tokenized text={pub.title} />
                )}
              </h3>
              {pub.author && typeof pub.author === "string" && (
                <p className="text-sm text-muted">
                  {pub.author.split(" and ").map((author, i, arr) => (
                    <span key={i}>
                      {isMe(author) ? <span className="font-medium text-ink">{author}</span> : author}
                      {i < arr.length - 1 && (i === arr.length - 2 ? " and " : ", ")}
                    </span>
                  ))}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                <span className="text-ink">{formatPubDate(pub)}</span>
                {pub.venue && pub.venue !== "Unknown Venue" && (
                  <span className="normal-case tracking-normal">{pub.venue}</span>
                )}
                {awardFor(pub) && (
                  <span className="bg-accent px-1.5 py-0.5 text-accent-ink">★ {awardFor(pub)}</span>
                )}
              </div>
            </div>

            {pub.citation_count > 0 && (
              <div className="col-start-2 mt-4 flex items-baseline gap-2 md:col-start-3 md:mt-0 md:flex-col md:items-end md:gap-0">
                <span className="font-serif text-4xl leading-none md:text-5xl">{pub.citation_count}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                  {pub.citation_count === 1 ? "citation" : "citations"}
                </span>
              </div>
            )}

            {/* The row's underline doubles as a bar chart of citations */}
            <span className="absolute inset-x-0 bottom-0 h-px bg-line" />
            <span
              className="absolute bottom-0 left-0 h-[2px] bg-accent transition-[width] duration-700"
              style={{ width: `${(pub.citation_count / maxCitations) * 100}%` }}
            />
          </motion.li>
        ))}
      </ol>

      {collapsible && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => {
            // When collapsing, jump back to the list so the reader isn't left far below it
            if (expanded) listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            setExpanded(!expanded);
          }}
          className="group mt-10 flex w-full items-center justify-center gap-3 border border-line py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:border-ink hover:text-ink"
        >
          {expanded ? "Show less" : `Show all ${sorted.length} publications`}
          <span className={`transition-transform ${expanded ? "rotate-180" : "group-hover:translate-y-0.5"}`}>↓</span>
        </button>
      )}
    </>
  );
}

