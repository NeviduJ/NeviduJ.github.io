import Tokenized from "./Tokenized";

export default function SectionHeading({
  index,
  title,
  count,
  children,
}: {
  index: string;
  title: string;
  count?: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-t border-ink pt-5 md:mb-16">
      <div className="flex items-start gap-4">
        <span className="mt-2 font-mono text-xs text-accent">§{index}</span>
        <h2 className="tok-group font-serif text-5xl leading-[0.9] tracking-tight md:text-7xl">
          <Tokenized text={title} />
          {count !== undefined && (
            <sup className="ml-2 align-super font-mono text-sm tracking-normal text-muted">({count})</sup>
          )}
        </h2>
      </div>
      {children}
    </div>
  );
}
