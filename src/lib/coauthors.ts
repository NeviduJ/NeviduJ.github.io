import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { isMe, type Publication } from "./publications";

export type NetworkNode = {
  id: string;
  name: string;
  papers: string[];
  me: boolean;
  x: number;
  y: number;
};

export type NetworkLink = { source: string; target: string; weight: number };

export const nodeRadius = (node: Pick<NetworkNode, "me" | "papers">) =>
  node.me ? 26 : 5 + Math.min(node.papers.length, 5) * 2.5;

type SimNode = SimulationNodeDatum & Omit<NetworkNode, "x" | "y">;

// Builds the co-author graph from Google Scholar author lists and lays it out
// with a force simulation. Runs at build time, so the browser only draws it.
export function buildCoauthorNetwork(pubs: Publication[], width: number, height: number) {
  const nodes = new Map<string, SimNode>();
  const links = new Map<string, NetworkLink>();
  // Scholar spells some names more than one way (e.g. "De Silva" / "de Silva");
  // count each spelling so the node shows the most common one
  const spellings = new Map<string, Map<string, number>>();

  for (const pub of pubs) {
    if (!pub.author) continue;
    const authors = pub.author.split(" and ").map((a) => a.trim()).filter(Boolean);
    const ids = [...new Set(authors.map((a) => a.toLowerCase()))];

    for (const name of authors) {
      const id = name.toLowerCase();
      const counts = spellings.get(id) ?? new Map<string, number>();
      counts.set(name, (counts.get(name) ?? 0) + 1);
      spellings.set(id, counts);
      if (!nodes.has(id)) nodes.set(id, { id, name, papers: [], me: isMe(name) });
    }
    for (const id of ids) nodes.get(id)!.papers.push(pub.title);

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const [a, b] = [ids[i], ids[j]].sort();
        const key = `${a}|${b}`;
        const link = links.get(key) ?? { source: a, target: b, weight: 0 };
        link.weight++;
        links.set(key, link);
      }
    }
  }

  for (const [id, counts] of spellings) {
    nodes.get(id)!.name = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  const simNodes = [...nodes.values()];
  const me = simNodes.find((n) => n.me);
  if (me) {
    me.fx = width / 2;
    me.fy = height / 2;
  }

  type SimLink = SimulationLinkDatum<SimNode> & { weight: number };
  const simLinks: SimLink[] = [...links.values()].map((l) => ({ ...l }));
  const touchesMe = (l: SimLink) => (l.source as SimNode).me || (l.target as SimNode).me;

  forceSimulation(simNodes)
    .force(
      "link",
      forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance((l) => (touchesMe(l) ? 250 - (l.weight - 1) * 30 : 70))
        .strength((l) => (touchesMe(l) ? 0.6 : 0.25))
    )
    .force("charge", forceManyBody().strength(-800))
    .force("collide", forceCollide<SimNode>((d) => nodeRadius(d) + 46))
    .force("x", forceX(width / 2).strength(0.015))
    .force("y", forceY(height / 2).strength(0.05))
    .stop()
    .tick(500);

  const pad = 40;
  const clamp = (v: number, max: number) => Math.max(pad, Math.min(max - pad, v));

  return {
    nodes: simNodes.map<NetworkNode>((n) => ({
      id: n.id,
      name: n.name,
      papers: n.papers,
      me: n.me,
      x: clamp(n.x ?? 0, width),
      y: clamp(n.y ?? 0, height),
    })),
    links: [...links.values()],
  };
}
