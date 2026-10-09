import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download } from "lucide-react";
import { cvPdfHref, profile, education, experience, projects, skills, achievements, references } from "@/data/resume";
import publications from "../../../data/publications.json";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Publications from "@/components/Publications";
import SectionHeading from "@/components/SectionHeading";
import Tokenized from "@/components/Tokenized";
import * as motion from "framer-motion/client";

export default function Resume() {
    return (
        <>
            <Nav />
            <main className="mx-auto max-w-6xl px-6 pb-24">
                <div className="relative pb-20 pt-14 md:pb-28 md:pt-24">
                    <Link
                        href="/"
                        className="group mb-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                        Back to home
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="font-serif text-[clamp(3.5rem,11vw,9rem)] leading-[0.85] tracking-[-0.03em]"
                    >
                        Curriculum <span className="italic text-accent">Vitae</span>
                    </motion.h1>
                    <motion.a
                        href={cvPdfHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="group mt-10 inline-flex items-center gap-3 bg-accent px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-ink transition-opacity hover:opacity-90"
                    >
                        <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                        Download PDF
                    </motion.a>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-14 grid gap-8 md:grid-cols-12"
                    >
                        <p className="tok-group font-serif text-2xl leading-snug hyphens-auto md:col-span-8 md:text-justify md:text-3xl">
                            <Tokenized text={profile[0]} />
                        </p>
                        <div className="space-y-4 text-justify text-sm leading-relaxed text-muted hyphens-auto md:col-span-4">
                            {profile.slice(1).map((paragraph, i) => (
                                <p key={i} className="tok-group">
                                    <Tokenized text={paragraph} />
                                </p>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <section className="mb-24 md:mb-32">
                    <SectionHeading index="01" title="Education" />
                    <TimelineRows
                        rows={education.map((edu) => ({
                            period: edu.period,
                            title: edu.degree,
                            subtitle: edu.institution,
                            bullets: edu.bullets,
                        }))}
                    />
                </section>

                <section className="mb-24 md:mb-32">
                    <SectionHeading index="02" title="Experience" />
                    <TimelineRows
                        rows={experience.map((job) => ({
                            period: job.period,
                            title: job.role,
                            subtitle: job.company,
                            tag: job.employmentType,
                            bullets: job.bullets,
                        }))}
                    />
                </section>

                <section className="mb-24 md:mb-32">
                    <Publications publications={publications} index="03" />
                </section>

                <section className="mb-24 md:mb-32">
                    <SectionHeading index="04" title="Projects" />
                    <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
                        {projects.map((project, index) => (
                            <div key={project.name} className="flex flex-col bg-paper p-6 md:odd:last:col-span-2">
                                <span className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                                    P/{String(index + 1).padStart(2, "0")}
                                </span>
                                <h3 className="tok-group mb-3 font-serif text-2xl leading-tight">
                                    <Tokenized text={project.name} />
                                </h3>
                                <p className="tok-group mb-6 text-sm leading-relaxed text-muted">
                                    <Tokenized text={project.description} />
                                </p>
                                {project.links.length > 0 && (
                                    <div className="mt-auto flex gap-4">
                                        {project.links.map((link) => (
                                            <a
                                                key={link.href}
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.15em] text-accent"
                                            >
                                                <span className="link-draw">{link.label}</span>
                                                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-24 md:mb-32">
                    <SectionHeading index="05" title="Technologies" />
                    <div className="space-y-8">
                        {skills.map((group) => (
                            <div key={group.label} className="grid gap-4 md:grid-cols-12 md:gap-8">
                                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted md:col-span-3 md:pt-2">
                                    {group.label}
                                </span>
                                <div className="flex flex-wrap gap-2 md:col-span-9">
                                    {group.items.map((item) => (
                                        <span key={item} className="border border-line px-3 py-1.5 text-sm">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-24 md:mb-32">
                    <SectionHeading index="06" title="Achievements" />
                    <ol>
                        {achievements.map((item, index) => (
                            <li key={item.title} className="grid gap-2 border-b border-line py-6 md:grid-cols-12 md:gap-8">
                                <span className="font-mono text-xs text-accent md:col-span-3 md:pt-1.5">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <div className="space-y-1 md:col-span-9">
                                    <h3 className="tok-group font-serif text-2xl leading-tight">
                                        <Tokenized text={item.title} />
                                    </h3>
                                    {item.detail && (
                                        <p className="tok-group text-sm text-muted">
                                            <Tokenized text={item.detail} />
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section>
                    <SectionHeading index="07" title="References" />
                    <div className="grid gap-px border border-line bg-line md:grid-cols-2">
                        {references.map((ref) => (
                            <div key={ref.name} className="bg-paper p-6">
                                <h3 className="tok-group font-serif text-2xl">
                                    <Tokenized text={ref.name} />
                                </h3>
                                <p className="mt-1 text-sm text-muted">{ref.title}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                        Contact details available on request
                    </p>
                </section>
            </main>
            <Footer />
        </>
    );
}

function TimelineRows({
    rows,
}: {
    rows: { period: string; title: string; subtitle: string; tag?: string; bullets?: string[] }[];
}) {
    return (
        <ol>
            {rows.map((row, index) => (
                <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group grid gap-3 border-b border-line py-8 md:grid-cols-12 md:gap-8"
                >
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted transition-colors group-hover:text-accent md:col-span-3 md:pt-2">
                        {row.period}
                    </span>
                    <div className="space-y-2 md:col-span-9">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="tok-group font-serif text-3xl leading-tight md:text-4xl">
                                <Tokenized text={row.title} />
                            </h3>
                            {row.tag && (
                                <span className="border border-accent px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
                                    {row.tag}
                                </span>
                            )}
                        </div>
                        <p className="tok-group text-muted">
                            <Tokenized text={row.subtitle} />
                        </p>
                        {row.bullets && row.bullets.length > 0 && (
                            <ul className="space-y-2 pt-3">
                                {row.bullets.map((bullet, i) => (
                                    <li key={i} className="tok-group relative pl-6 text-sm leading-relaxed text-muted">
                                        <span className="absolute left-0 top-[0.6em] h-px w-3 bg-accent" />
                                        <Tokenized text={bullet} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </motion.li>
            ))}
        </ol>
    );
}
