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

export type SharedPaper = { title: string; url: string | null };

export type NetworkNode = {
  id: string;
  name: string;
  papers: SharedPaper[];
  me: boolean;
  x: number;
  y: number;
};

export type NetworkLink = { source: string; target: string; weight: number };

export const nodeRadius = (node: Pick<NetworkNode, "me" | "papers">) =>
  node.me ? 26 : 5 + Math.min(node.papers.length, 5) * 2.5;

// Name labels: 10.5px uppercase mono with 0.08em tracking, drawn LABEL_OFFSET below the circle.
// Shared with CoauthorNetwork so the layout checks measure exactly what gets drawn.
export const LABEL_CHAR_WIDTH = 7.2;
export const LABEL_OFFSET = 16;
const LABEL_HEIGHT = 12;

// Labels always shown (not just on hover); the component uses the same rule
export const hasPermanentLabel = (node: Pick<NetworkNode, "me" | "papers">) => !node.me && node.papers.length > 1;

type SimNode = SimulationNodeDatum & Omit<NetworkNode, "x" | "y">;

// Builds the co-author graph from Google Scholar author lists and lays it out.
// Runs at build time (including every daily Scholar sync), so the browser only draws it.
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
    for (const id of ids) nodes.get(id)!.papers.push({ title: pub.title, url: pub.url ?? null });

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
  const linkList = [...links.values()];
  const best = bestLayout(simNodes, linkList, groupByFirstPaper(pubs, nodes), width, height);

  if (best.issues.total > 0) {
    // Shows up in the deploy log; the graph still renders with the cleanest layout found
    console.warn(`[collaborators] layout has unresolved issues: ${JSON.stringify(best.issues)}`);
  }

  return {
    nodes: simNodes.map<NetworkNode>((n) => ({
      id: n.id,
      name: n.name,
      papers: n.papers,
      me: n.me,
      x: best.positions.get(n.id)!.x,
      y: best.positions.get(n.id)!.y,
    })),
    links: linkList,
  };
}

// --- Layout ---------------------------------------------------------------------------
// Each paper's group of co-authors gets its own slice of the circle around the centre
// node, so groups don't mix and lines don't run through people they don't belong to.
// Many candidate arrangements are generated, repaired and scored; the cleanest wins.
// Nothing is tuned to today's data, so it keeps working as collaborators are added.

type Point = { x: number; y: number };
type Issues = { lineThroughNode: number; nodeOverlap: number; labelOverlap: number; total: number; examples: string[] };

// People are grouped by the first paper (oldest first) they appear on
function groupByFirstPaper(pubs: Publication[], nodes: Map<string, SimNode>): SimNode[][] {
  const byDate = [...pubs].sort((p, q) => (p.pub_date ?? String(p.year)).localeCompare(q.pub_date ?? String(q.year)));
  const groups: SimNode[][] = [];
  const grouped = new Set<string>();
  for (const pub of byDate) {
    const group = (pub.author ?? "")
      .split(" and ")
      .map((a) => nodes.get(a.trim().toLowerCase()))
      .filter((n): n is SimNode => !!n && !n.me && !grouped.has(n.id));
    group.forEach((n) => grouped.add(n.id));
    if (group.length) groups.push(group.sort((x, y) => y.papers.length - x.papers.length));
  }
  return groups;
}

// Alternate big and small groups so long arcs of single-paper people don't bunch up
function interleave<T>(groups: T[][]): T[][] {
  const sorted = [...groups].sort((a, b) => b.length - a.length);
  const out: T[][] = [];
  while (sorted.length) {
    out.push(sorted.shift()!);
    if (sorted.length) out.push(sorted.pop()!);
  }
  return out;
}

function bestLayout(simNodes: SimNode[], links: NetworkLink[], groups: SimNode[][], width: number, height: number) {
  const orders = [groups, [...groups].reverse(), interleave(groups)];
  const rotations = 24;
  // Bigger networks get more room
  const baseRadius = 230 + 6 * Math.max(0, simNodes.length - 26);
  let best: { positions: Map<string, Point>; issues: Issues; score: number } | null = null;

  for (const order of orders) {
    for (let k = 0; k < rotations; k++) {
      for (const spread of [1, 1.2]) {
        const positions = placeAndRelax(simNodes, links, order, width, height, (2 * Math.PI * k) / rotations, baseRadius * spread);
        repair(positions, simNodes, links);
        const issues = findIssues(positions, simNodes, links);
        // Prefer clean layouts first, then compact ones
        const score = issues.total * 1e6 + boundingArea(positions);
        if (!best || score < best.score) best = { positions, issues, score };
      }
    }
  }
  return best!;
}

function placeAndRelax(
  simNodes: SimNode[],
  links: NetworkLink[],
  groups: SimNode[][],
  width: number,
  height: number,
  startAngle: number,
  radius: number
): Map<string, Point> {
  const centre = { x: width / 2, y: height / 2 };
  const total = groups.reduce((sum, g) => sum + g.length, 0);
  // Wider than tall to suit the frame, but bigger networks also grow taller: the graph is
  // scaled to the frame's width, so growing only sideways would shrink every name
  const extra = Math.max(0, simNodes.length - 26);
  const stretch = { x: Math.max(1.15, 1.55 - 0.012 * extra), y: Math.min(1.35, 0.95 + 0.012 * extra) };
  const target = new Map<string, Point>();
  let angle = startAngle - Math.PI / 2;
  for (const group of groups) {
    const slice = (2 * Math.PI * group.length) / total;
    group.forEach((n, i) => {
      const a = angle + (slice * (i + 0.5)) / group.length;
      // Frequent collaborators sit closer to the centre
      const r = radius - 45 * (Math.min(n.papers.length, 4) - 1);
      target.set(n.id, { x: centre.x + Math.cos(a) * r * stretch.x, y: centre.y + Math.sin(a) * r * stretch.y });
    });
    angle += slice;
  }

  const sim = simNodes.map((n) => {
    const t = target.get(n.id) ?? centre;
    return { ...n, x: t.x, y: t.y, vx: 0, vy: 0, ...(n.me ? { fx: centre.x, fy: centre.y } : {}) };
  });
  type SimLink = SimulationLinkDatum<SimNode>;
  const simLinks: SimLink[] = links.map((l) => ({ source: l.source, target: l.target }));

  forceSimulation(sim)
    .force("home-x", forceX<SimNode>((d) => target.get(d.id)?.x ?? centre.x).strength(0.35))
    .force("home-y", forceY<SimNode>((d) => target.get(d.id)?.y ?? centre.y).strength(0.35))
    .force("link", forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).strength(0.02))
    .force("charge", forceManyBody().strength(-60))
    .force("collide", forceCollide<SimNode>((d) => nodeRadius(d) + 40))
    .stop()
    .tick(300);

  return new Map(sim.map((n) => [n.id, { x: n.x ?? centre.x, y: n.y ?? centre.y }]));
}

const segmentDistance = (p: Point, a: Point, b: Point) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return { d: Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)), cx: a.x + t * dx, cy: a.y + t * dy };
};

const labelBox = (n: SimNode, p: Point) => {
  const half = (n.name.length * LABEL_CHAR_WIDTH) / 2;
  const top = p.y + nodeRadius(n) + LABEL_OFFSET - LABEL_HEIGHT + 2;
  return { left: p.x - half, right: p.x + half, top, bottom: top + LABEL_HEIGHT };
};

const boxHitsCircle = (box: ReturnType<typeof labelBox>, c: Point, r: number) => {
  const nx = Math.max(box.left, Math.min(c.x, box.right));
  const ny = Math.max(box.top, Math.min(c.y, box.bottom));
  return Math.hypot(c.x - nx, c.y - ny) < r + 3;
};

const boxesHit = (a: ReturnType<typeof labelBox>, b: ReturnType<typeof labelBox>) =>
  a.left < b.right + 6 && b.left < a.right + 6 && a.top < b.bottom + 2 && b.top < a.bottom + 2;

const LINE_CLEARANCE = 6;
const NODE_GAP = 14;

// Nudge nodes off lines they aren't part of and push apart overlapping nodes
function repair(pos: Map<string, Point>, simNodes: SimNode[], links: NetworkLink[]) {
  const byId = new Map(simNodes.map((n) => [n.id, n]));
  for (let iter = 0; iter < 150; iter++) {
    let moved = false;
    for (const n of simNodes) {
      if (n.me) {
        // The centre node is fixed, so move lines that cross it instead: shift both ends sideways
        const p = pos.get(n.id)!;
        const need = nodeRadius(n) + LINE_CLEARANCE;
        for (const l of links) {
          if (l.source === n.id || l.target === n.id) continue;
          const a = pos.get(l.source)!, b = pos.get(l.target)!;
          const { d, cx, cy } = segmentDistance(p, a, b);
          if (d < need) {
            const ux = d > 0.01 ? (cx - p.x) / d : 0, uy = d > 0.01 ? (cy - p.y) / d : 1;
            for (const e of [a, b]) {
              e.x += ux * (need - d + 1);
              e.y += uy * (need - d + 1);
            }
            moved = true;
          }
        }
        continue;
      }
      const p = pos.get(n.id)!;
      const r = nodeRadius(n);
      for (const l of links) {
        if (l.source === n.id || l.target === n.id) continue;
        const { d, cx, cy } = segmentDistance(p, pos.get(l.source)!, pos.get(l.target)!);
        const need = r + LINE_CLEARANCE;
        if (d < need) {
          // Node steps off the line and the line steps the other way, sharing the
          // correction, so a node caught between several groups' lines can't oscillate
          const ux = d > 0.01 ? (p.x - cx) / d : 1, uy = d > 0.01 ? (p.y - cy) / d : 0;
          const step = need - d + 1;
          p.x += ux * step * 0.6;
          p.y += uy * step * 0.6;
          for (const id of [l.source, l.target]) {
            if (byId.get(id)!.me) continue;
            const e = pos.get(id)!;
            e.x -= ux * step * 0.4;
            e.y -= uy * step * 0.4;
          }
          moved = true;
        }
      }
      for (const m of simNodes) {
        if (m === n) continue;
        const q = pos.get(m.id)!;
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        const need = r + nodeRadius(m) + NODE_GAP;
        if (d < need) {
          const ux = d > 0.01 ? (p.x - q.x) / d : 0, uy = d > 0.01 ? (p.y - q.y) / d : 1;
          p.x += ux * (need - d) * (m.me ? 1 : 0.5);
          p.y += uy * (need - d) * (m.me ? 1 : 0.5);
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

function findIssues(pos: Map<string, Point>, simNodes: SimNode[], links: NetworkLink[]): Issues {
  let lineThroughNode = 0, nodeOverlap = 0, labelOverlap = 0;
  const examples: string[] = [];
  const name = (id: string) => simNodes.find((x) => x.id === id)!.name;
  for (const n of simNodes) {
    const p = pos.get(n.id)!;
    const r = nodeRadius(n);
    for (const l of links) {
      if (l.source === n.id || l.target === n.id) continue;
      if (segmentDistance(p, pos.get(l.source)!, pos.get(l.target)!).d < r + LINE_CLEARANCE - 1) {
        lineThroughNode++;
        examples.push(`line ${name(l.source)}–${name(l.target)} crosses ${n.name}`);
      }
    }
    for (const m of simNodes) {
      if (m === n) continue;
      const q = pos.get(m.id)!;
      if (m.id > n.id && Math.hypot(p.x - q.x, p.y - q.y) < r + nodeRadius(m) + NODE_GAP - 1) nodeOverlap++;
      // Any label (shown on hover) must stay clear of other nodes; permanent labels of each other too
      if (!n.me && boxHitsCircle(labelBox(n, p), q, nodeRadius(m))) labelOverlap++;
      if (m.id > n.id && hasPermanentLabel(n) && hasPermanentLabel(m) && boxesHit(labelBox(n, p), labelBox(m, q))) labelOverlap++;
    }
  }
  return {
    lineThroughNode,
    nodeOverlap,
    labelOverlap,
    total: lineThroughNode + nodeOverlap + labelOverlap,
    examples: examples.slice(0, 5),
  };
}

function boundingArea(pos: Map<string, Point>) {
  const xs = [...pos.values()].map((p) => p.x), ys = [...pos.values()].map((p) => p.y);
  return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
}
