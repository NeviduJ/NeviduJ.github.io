"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nodeRadius, type NetworkLink, type NetworkNode } from "@/lib/coauthors";

// Labels are 10.5px uppercase mono with 0.08em tracking: about 7.2 units per character
const LABEL_CHAR_WIDTH = 7.2;
const LABEL_OFFSET = 16;

export default function CoauthorNetwork({
  nodes,
  links,
}: {
  nodes: NetworkNode[];
  links: NetworkLink[];
}) {
  // Hovering previews a collaborator; clicking pins them so their papers stay listed
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const activeId = hoverId ?? pinnedId;
  const togglePin = (id: string) => setPinnedId((current) => (current === id ? null : id));
  const scrollerRef = useRef<HTMLDivElement>(null);

  // When the graph is wider than the screen, start scrolled to the middle (where "NJ" is)
  useEffect(() => {
    const el = scrollerRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const neighbours = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const l of links) {
      map.set(l.source, (map.get(l.source) ?? new Set()).add(l.target));
      map.set(l.target, (map.get(l.target) ?? new Set()).add(l.source));
    }
    return map;
  }, [links]);

  // Crop to the graph itself so it fills the frame, leaving room for every name label
  // (labels are centred under their node, so a long name needs half its width either side)
  const viewBox = useMemo(() => {
    const pad = 30;
    const labelHalfWidth = (n: NetworkNode) => (n.me ? 0 : n.name.length * LABEL_CHAR_WIDTH) / 2;
    const minX = Math.min(...nodes.map((n) => n.x - Math.max(nodeRadius(n), labelHalfWidth(n)))) - pad;
    const maxX = Math.max(...nodes.map((n) => n.x + Math.max(nodeRadius(n), labelHalfWidth(n)))) + pad;
    const minY = Math.min(...nodes.map((n) => n.y - nodeRadius(n))) - pad;
    const maxY = Math.max(...nodes.map((n) => n.y + nodeRadius(n) + LABEL_OFFSET + 6)) + pad;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [nodes]);

  const active = activeId ? byId.get(activeId) : undefined;
  const isLit = (id: string) => !activeId || id === activeId || neighbours.get(activeId)?.has(id);
  // Draw lighter links first so the strong collaborations sit on top
  const sortedLinks = useMemo(() => [...links].sort((a, b) => a.weight - b.weight), [links]);

  return (
    <div
      className="relative border border-line"
      onKeyDown={(e) => {
        if (e.key === "Escape") setPinnedId(null);
      }}
    >
      {/* On narrow screens the graph keeps a readable size and scrolls sideways */}
      <div ref={scrollerRef} className="overflow-x-auto">
        <svg
          viewBox={viewBox}
          className="h-auto w-full min-w-[680px] touch-manipulation select-none"
          role="img"
          aria-label={`Co-author network: ${nodes.length - 1} collaborators`}
          onClick={() => setPinnedId(null)}
        >
          {sortedLinks.map((link) => {
            const a = byId.get(link.source)!;
            const b = byId.get(link.target)!;
            const highlighted = activeId !== null && (link.source === activeId || link.target === activeId);
            return (
              <line
                key={`${link.source}|${link.target}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={highlighted ? "var(--accent)" : "var(--muted)"}
                strokeWidth={0.6 + link.weight * 0.7}
                strokeOpacity={activeId === null ? 0.35 : highlighted ? 0.9 : 0.06}
                style={{ transition: "stroke-opacity 0.25s, stroke 0.25s" }}
              />
            );
          })}
          {nodes.map((node) => {
            const r = nodeRadius(node);
            const lit = isLit(node.id);
            const showLabel = node.me || node.papers.length > 1 || node.id === activeId;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x} ${node.y})`}
                tabIndex={0}
                role="button"
                aria-label={`${node.name}, ${node.papers.length} ${node.papers.length === 1 ? "paper" : "papers"}`}
                aria-pressed={node.id === pinnedId}
                className="cursor-pointer outline-none"
                style={{ opacity: lit ? 1 : 0.2, transition: "opacity 0.25s" }}
                onMouseEnter={() => setHoverId(node.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(node.id)}
                onBlur={() => setHoverId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(node.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    togglePin(node.id);
                  }
                }}
              >
                {node.id === activeId && !node.me && (
                  <circle
                    r={r + 6}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={node.id === pinnedId ? 2 : 1}
                  />
                )}
                <circle
                  r={r}
                  fill={node.me ? "var(--accent)" : node.id === activeId ? "var(--accent)" : "var(--paper)"}
                  stroke={node.me || node.id === activeId ? "var(--accent)" : "var(--ink)"}
                  strokeWidth={1.5}
                />
                {node.me && (
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    className="font-serif"
                    fontSize={22}
                    fill="var(--accent-ink)"
                  >
                    NJ
                  </text>
                )}
                {showLabel && !node.me && (
                  <text
                    y={r + LABEL_OFFSET}
                    textAnchor="middle"
                    className="font-mono uppercase"
                    fontSize={10.5}
                    letterSpacing="0.08em"
                    fill={node.id === activeId ? "var(--ink)" : "var(--muted)"}
                    stroke="var(--paper)"
                    strokeWidth={4}
                    paintOrder="stroke"
                  >
                    {node.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Details sit below the graph (fixed height, so nothing jumps) and never cover a node */}
      <div className="min-h-[8.5rem] border-t border-line p-4 md:px-6">
        {active && !active.me ? (
          <>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-medium">{active.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                {active.id === pinnedId ? "Pinned · click again to release" : "Click to pin"}
              </p>
            </div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
              {active.papers.length} {active.papers.length === 1 ? "paper" : "papers"} together
            </p>
            <ul className="space-y-1">
              {active.papers.map((paper) => (
                <li key={paper.title} className="line-clamp-1 text-xs text-muted">
                  {paper.url ? (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-accent"
                    >
                      {paper.title} ↗
                    </a>
                  ) : (
                    paper.title
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            {nodes.length - 1} collaborators · Hover a name to preview shared papers, click to pin
          </p>
        )}
      </div>
    </div>
  );
}
