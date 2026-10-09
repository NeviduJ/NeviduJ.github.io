import Link from "next/link";
import { ArrowUpRight, ArrowDown, Star, GitFork } from "lucide-react";
import publications from "../../data/publications.json";
import { getTopRepos } from "@/lib/github";
import { cvPdfHref, profile } from "@/data/resume";
import Publications from "@/components/Publications";
import ScriptMorph from "@/components/ScriptMorph";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
import Tokenized from "@/components/Tokenized";
import Spotlight from "@/components/Spotlight";
import CoauthorNetwork from "@/components/CoauthorNetwork";
import { buildCoauthorNetwork } from "@/lib/coauthors";
import * as motion from "framer-motion/client";
import { Suspense } from "react";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/NeviduJ" },
  { label: "Google Scholar", href: "https://scholar.google.com/citations?user=2pDm_0UAAAAJ&hl=en&oi=ao" },
  { label: "HuggingFace", href: "https://huggingface.co/Nevidu" },
  { label: "ResearchGate", href: "https://www.researchgate.net/profile/Nevidu-Jayatilleke" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/nevidu-jayatilleke" },
  { label: "CV (PDF)", href: cvPdfHref },
];

// The name in Sinhala and Tamil, shown before it settles into English
const FIRST_NAME = [
  { text: "නෙවිදු", font: "font-sinhala" as const },
  { text: "நெவிது", font: "font-tamil" as const },
];
const LAST_NAME = [
  { text: "ජයතිලක", font: "font-sinhala" as const },
  { text: "ஜயதிலக", font: "font-tamil" as const },
];

// Research interests from the CV
const TOPICS = [
  "Computational Semantics",
  "Diachronic Linguistics",
  "Semantic Change",
  "Diachronic Corpora",
  "Machine Translation",
  "Optical Character Recognition",
  "Text Summarisation",
  "Information Extraction",
  "Speech Recognition",
  "LLM Value Alignment",
];

const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  "Jupyter Notebook": "#DA5B0B",
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  HTML: "#E34C26",
};

const NETWORK_WIDTH = 1100;
const NETWORK_HEIGHT = 620;

async function ProjectsSection() {
  const repos = await getTopRepos("NeviduJ");

  return (
    <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo: any, index: number) => (
        <motion.a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.06 }}
          className="group flex min-h-56 flex-col bg-paper p-6 transition-colors duration-300 hover:bg-accent hover:text-accent-ink"
        >
          <div className="mb-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.15em] text-muted group-hover:text-accent-ink/70">
            <span>R/{String(index + 1).padStart(2, "0")}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
          <h3 className="tok-group mb-3 break-words text-lg font-semibold tracking-tight">
            <Tokenized text={repo.name} />
          </h3>
          {repo.description && (
            <p className="tok-group mb-6 line-clamp-3 text-sm text-muted group-hover:text-accent-ink/80">
              <Tokenized text={repo.description} />
            </p>
          )}
          <div className="mt-auto flex gap-4 font-mono text-[11px] text-muted group-hover:text-accent-ink/80">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: LANGUAGE_COLORS[repo.language] ?? "currentColor" }}
                />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" /> {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3 w-3" /> {repo.forks_count}
            </span>
          </div>
        </motion.a>
      ))}
    </div>
  );
}

export default async function Home() {
  const profileImageSrc = "/profile.jpg?v=3";
  const network = buildCoauthorNetwork(publications, NETWORK_WIDTH, NETWORK_HEIGHT);

  return (
    <>
      <Nav />
      <main className="overflow-x-clip">
        {/* Hero */}
        <section className="relative">
          <Spotlight />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-[2vw] right-[-14vw] select-none font-sinhala text-[70vw] leading-none text-transparent [-webkit-text-stroke:1px_var(--line)] md:right-[-4vw] md:text-[38vw]"
          >
            අ
          </div>
          {/* The same glyph in vermilion, revealed only around the cursor. The mask sits on a
              full-size wrapper so its coordinates match the spotlight's */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500"
            style={{
              opacity: "var(--spot, 0)",
              maskImage: "radial-gradient(300px circle at var(--spot-x) var(--spot-y), #000, transparent 75%)",
              WebkitMaskImage: "radial-gradient(300px circle at var(--spot-x) var(--spot-y), #000, transparent 75%)",
            }}
          >
            <div className="absolute -top-[2vw] right-[-14vw] select-none font-sinhala text-[70vw] leading-none text-transparent [-webkit-text-stroke:1.5px_var(--accent)] md:right-[-4vw] md:text-[38vw]">
              අ
            </div>
          </div>

          <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 md:pb-24 md:pt-24">
            <h1 className="font-serif text-[clamp(4.25rem,15vw,12.5rem)] leading-[0.82] tracking-[-0.03em]">
              <span className="block">
                <ScriptMorph text="Nevidu" variants={FIRST_NAME} />
              </span>
              <span className="block pl-[6vw] italic">
                <ScriptMorph text="Jayatilleke" variants={LAST_NAME} delay={150} />
                <span className="not-italic text-accent">.</span>
              </span>
            </h1>

            <div className="mt-14 grid items-end gap-12 md:mt-20 md:grid-cols-12">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="space-y-8 md:col-span-8"
              >
                <p className="tok-group max-w-xl text-xl leading-snug md:text-2xl">
                  <Tokenized text="A Sri Lankan NLP researcher with a special focus on " />
                  <em className="font-serif text-[1.2em] text-accent">
                    <Tokenized text="multilingual AI" />
                  </em>
                  .
                </p>
                <div className="flex flex-wrap gap-2">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                    >
                      {social.label}
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ))}
                </div>
              </motion.div>

              <motion.figure
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="md:col-span-4 md:col-start-9 md:justify-self-end"
              >
                <div className="group relative w-44 md:w-56">
                  <span className="absolute -left-2 -top-2 h-4 w-4 border-l-2 border-t-2 border-accent" />
                  <span className="absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-accent" />
                  <img
                    src={profileImageSrc}
                    alt="Nevidu Jayatilleke"
                    className="aspect-[4/5] w-full object-cover grayscale contrast-110 transition duration-500 group-hover:grayscale-0"
                  />
                </div>
              </motion.figure>
            </div>
          </div>

          <div className="overflow-hidden bg-accent py-4 text-accent-ink" aria-hidden="true">
            <div className="marquee flex w-max whitespace-nowrap font-serif text-2xl italic md:text-3xl">
              {[...TOPICS, ...TOPICS].map((topic, i) => (
                <span key={i} className="flex items-center">
                  {topic}
                  <span className="mx-8 font-sans text-base not-italic">✳</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 md:py-32">
          <SectionHeading index="01" title="About">
            <Link
              href="/resume"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-accent"
            >
              <span className="link-draw">Full CV</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </SectionHeading>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="tok-group max-w-5xl font-serif text-3xl leading-[1.15] hyphens-auto md:text-justify md:text-[2.75rem]">
              <Tokenized text={profile[0]} />
            </p>
            <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-2 md:gap-12">
              {profile.slice(1).map((paragraph, i) => (
                <p key={i} className="tok-group text-justify leading-relaxed text-muted hyphens-auto md:text-lg">
                  <Tokenized text={paragraph} />
                </p>
              ))}
            </div>
            <div className="mt-12 grid gap-4 border-t border-line pt-8 md:mt-16 md:grid-cols-12 md:gap-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted md:col-span-3 md:pt-2">
                Research interests
              </p>
              <div className="flex flex-wrap gap-2 md:col-span-9">
                {TOPICS.map((topic) => (
                  <span key={topic} className="border border-line px-3 py-1.5 text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Publications */}
        <section id="publications" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 md:py-32">
          <Publications publications={publications} />
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            Synced daily from Google Scholar
          </p>
        </section>

        {/* Collaborators */}
        <section id="collaborators" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 md:py-32">
          <SectionHeading index="03" title="Collaborators" count={network.nodes.length - 1} />
          <CoauthorNetwork nodes={network.nodes} links={network.links} />
        </section>

        {/* Projects */}
        <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 md:py-32">
          <SectionHeading index="04" title="Open Source">
            <a
              href="https://github.com/NeviduJ?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-accent"
            >
              <span className="link-draw">All repositories</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </SectionHeading>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="min-h-56 animate-pulse bg-paper p-6">
                    <div className="mb-3 h-5 w-3/4 bg-surface" />
                    <div className="mb-1 h-4 w-full bg-surface" />
                    <div className="h-4 w-5/6 bg-surface" />
                  </div>
                ))}
              </div>
            }
          >
            <ProjectsSection />
          </Suspense>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 md:py-32">
          <SectionHeading index="05" title="Contact" />
          <p className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <ArrowDown className="h-3 w-3 text-accent" /> Write to me
          </p>
          <a
            href="mailto:nevidu.25@cse.mrt.ac.lk"
            className="group inline-flex flex-wrap items-center gap-x-3 break-all font-serif text-[clamp(1.75rem,4vw,3rem)] italic leading-none transition-colors hover:text-accent"
          >
            nevidu.25@cse.mrt.ac.lk
            <ArrowUpRight className="h-[0.6em] w-[0.6em] shrink-0 text-accent transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </a>
          <p className="mt-10 text-muted">
            Or find me on{" "}
            <a
              href="https://www.linkedin.com/in/nevidu-jayatilleke"
              target="_blank"
              rel="noopener noreferrer"
              className="link-draw text-ink"
            >
              LinkedIn
            </a>
            .
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
