export type Publication = {
  title: string;
  year: number | string;
  pub_date?: string | null;
  citation_count: number;
  venue?: string;
  author?: string;
  url?: string | null;
};

export const isMe = (author: string) => author.includes("Jayatilleke") || author.includes("Nevidu");

export const isFirstAuthor = (pub: Publication) =>
  typeof pub.author === "string" && isMe(pub.author.split(" and ")[0]);

// "YYYY-MM-DD", "YYYY-MM" or "YYYY"; ISO strings compare correctly as text
const dateOf = (pub: Publication) => pub.pub_date || String(Number(pub.year) || 0);

const byDate = (a: Publication, b: Publication) => dateOf(b).localeCompare(dateOf(a));

const byYear = (a: Publication, b: Publication) =>
  byDate(a, b) || b.citation_count - a.citation_count;

const byCitations = (a: Publication, b: Publication) =>
  b.citation_count - a.citation_count || byDate(a, b);

export type SortMode = "default" | "year" | "citations";

export function sortPublications(pubs: Publication[], mode: SortMode) {
  if (mode === "year") return [...pubs].sort(byYear);
  if (mode === "citations") return [...pubs].sort(byCitations);
  // Default: first-author papers (most recent first), then the rest by citations
  const first = pubs.filter(isFirstAuthor).sort(byYear);
  const rest = pubs.filter((p) => !isFirstAuthor(p)).sort(byCitations);
  return [...first, ...rest];
}

// Awards aren't on Google Scholar, so they're matched to papers by title
const AWARDS: { titleIncludes: string; award: string }[] = [
  { titleIncludes: "From Sinhala to Dhivehi", award: "Best Paper · MERCon 2026" },
];

export const awardFor = (pub: Publication) =>
  AWARDS.find((a) => pub.title.includes(a.titleIncludes))?.award;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2025-09-14" -> "Sep 2025", falling back to the year
export function formatPubDate(pub: Publication) {
  const [year, month] = (pub.pub_date ?? "").split("-");
  if (year && month) return `${MONTHS[Number(month) - 1]} ${year}`;
  return String(pub.year);
}
