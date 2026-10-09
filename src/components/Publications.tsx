"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

type Publication = {
  title: string;
  year: number | string;
  pub_date?: string | null;
  citation_count: number;
  venue?: string;
  author?: string;
  url?: string | null;
};

type SortMode = "default" | "year" | "citations";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "year", label: "Year" },
  { value: "citations", label: "Citations" },
];

const isMe = (author: string) => author.includes("Jayatilleke") || author.includes("Nevidu");

const isFirstAuthor = (pub: Publication) =>
  typeof pub.author === "string" && isMe(pub.author.split(" and ")[0]);

// "YYYY-MM-DD", "YYYY-MM" or "YYYY"; ISO strings compare correctly as text
const dateOf = (pub: Publication) => pub.pub_date || String(Number(pub.year) || 0);

const byDate = (a: Publication, b: Publication) => dateOf(b).localeCompare(dateOf(a));

const byYear = (a: Publication, b: Publication) =>
  byDate(a, b) || b.citation_count - a.citation_count;

const byCitations = (a: Publication, b: Publication) =>
  b.citation_count - a.citation_count || byDate(a, b);

function sortPublications(pubs: Publication[], mode: SortMode) {
  if (mode === "year") return [...pubs].sort(byYear);
  if (mode === "citations") return [...pubs].sort(byCitations);
  // Default: first-author papers (most recent first), then the rest by citations
  const first = pubs.filter(isFirstAuthor).sort(byYear);
  const rest = pubs.filter((p) => !isFirstAuthor(p)).sort(byCitations);
  return [...first, ...rest];
}

export default function Publications({ publications }: { publications: Publication[] }) {
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const sorted = useMemo(() => sortPublications(publications, sortMode), [publications, sortMode]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          Publications
          <span className="text-sm font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-full">
            {publications.length}
          </span>
        </h2>
        <div
          role="group"
          aria-label="Sort publications"
          className="inline-flex text-sm bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSortMode(option.value)}
              aria-pressed={sortMode === option.value}
              className={`px-3 py-1 rounded-md transition-colors ${
                sortMode === option.value
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-10">
        {sorted.map((pub, index) => (
          <motion.article
            key={pub.title}
            layout
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group border-l-2 border-neutral-200 dark:border-neutral-800 pl-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-3 flex-1">
                <h3 className="font-semibold text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                  {pub.url ? (
                    <a href={pub.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {pub.title}
                    </a>
                  ) : (
                    pub.title
                  )}
                </h3>
                <div className="text-sm space-y-1">
                  {pub.author && typeof pub.author === 'string' && (
                    <div className="text-neutral-700 dark:text-neutral-300">
                      {pub.author.split(' and ').map((author: string, i: number, arr: string[]) => (
                        <span key={i}>
                          {isMe(author) ? (
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{author}</span>
                          ) : (
                            author
                          )}
                          {i < arr.length - 1 && (
                            i === arr.length - 2 ? " and " : ", "
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-neutral-500 dark:text-neutral-400">
                    <span className="font-medium">{pub.year}</span>
                    {pub.venue && pub.venue !== "Unknown Venue" && (
                      <span className="italic"> • {pub.venue}</span>
                    )}
                  </div>
                </div>
              </div>
              {pub.citation_count > 0 && (
                <div className="shrink-0 flex flex-col items-center gap-1 bg-neutral-100 dark:bg-neutral-900 px-3 py-2 rounded-lg">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-semibold">{pub.citation_count}</span>
                  <span className="text-xs text-neutral-500">cites</span>
                </div>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </>
  );
}
