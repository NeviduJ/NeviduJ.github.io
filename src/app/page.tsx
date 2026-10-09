import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Mail, BookOpen, Star, GitFork, ExternalLink } from "lucide-react";
import publications from "../../data/publications.json";
import { getTopRepos } from "@/lib/github";
import Publications from "@/components/Publications";
import * as motion from "framer-motion/client";
import { Suspense } from "react";

async function ProjectsSection() {
  const repos = await getTopRepos("NeviduJ");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {repos.map((repo: any) => (
        <motion.a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all group"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {repo.name}
            </h3>
            <ExternalLink className="w-4 h-4 text-neutral-400" />
          </div>
          {repo.description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4">
              {repo.description}
            </p>
          )}
          <div className="flex gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" /> {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" /> {repo.forks_count}
            </span>
            {repo.language && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {repo.language}
              </span>
            )}
          </div>
        </motion.a>
      ))}
    </div>
  );
}

export default async function Home() {
  // Hardcoded basePath - works in both dev and production without env variables
  const basePath = typeof window === 'undefined' && process.env.NODE_ENV === 'production'
    ? '/Nevidu-Jayatilleke'
    : '';
  const profileImageSrc = `${basePath}/profile.jpg?v=3`;

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-8 items-start md:items-center"
        >
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 overflow-hidden rounded-full border-2 border-neutral-100 dark:border-neutral-800">
            <img
              src={profileImageSrc}
              alt="Nevidu Jayatilleke"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Nevidu Jayatilleke
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Researcher specialising in Natural Language Processing
            </p>
            <div className="flex gap-3 pt-2 flex-wrap items-center">
              <SocialLink href="https://github.com/NeviduJ" icon={<Github className="w-4 h-4" />} label="GitHub" showLabel={true} />
              <SocialLink href="https://scholar.google.com/citations?user=2pDm_0UAAAAJ&hl=en&oi=ao" icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.4 24 0 18.6 0 12S5.4 0 12 0s12 5.4 12 12-5.4 12-12 12zm0-22C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 16.5V17c-2.8-.7-4.5-2.6-4.5-5.5 0-3.1 2.1-5 5.5-5s5.5 1.9 5.5 5c0 2.4-1.1 4.1-3 4.8v1.7c2.3-.6 4-2.6 4-5.5 0-3.9-2.9-6.5-6.5-6.5S5.5 8.6 5.5 12c0 3.3 2 5.4 5.5 6.5z" /></svg>} label="Google Scholar" showLabel={true} />
              <SocialLink href="https://huggingface.co/Nevidu" icon={<span className="text-sm font-semibold">🤗</span>} label="HuggingFace" showLabel={true} />
              <SocialLink href="https://www.researchgate.net/profile/Nevidu-Jayatilleke" icon={<span className="text-sm font-semibold">RG</span>} label="ResearchGate" showLabel={true} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="max-w-3xl mx-auto px-6 py-12 border-t border-neutral-100 dark:border-neutral-900">
        <h2 className="text-2xl font-semibold mb-6">About</h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="prose dark:prose-invert text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-4"
        >
          <p className="md:text-justify">
            I am a Postgraduate Researcher from the University of Moratuwa, Sri Lanka, specialising primarily in the field of Natural Language Processing (NLP). My work is dedicated to developing technological solutions for challenging linguistic tasks, particularly focusing on advancing the capabilities of AI for low-resource languages such as Sinhala and Tamil.
          </p>
          <p className="md:text-justify">
            I am deeply committed to research that bridges the digital language divide, ensuring that AI technologies are universally accessible and effective across diverse linguistic backgrounds. Through my academic pursuits and research contributions, I strive to make significant advancements in the broader fields of artificial intelligence and computational linguistics.
          </p>
          <div className="pt-2">
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              More Info →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Publications Section - Now Prominent */}
      <section className="max-w-3xl mx-auto px-6 py-12 border-t border-neutral-100 dark:border-neutral-900">
        <Publications publications={publications} />
      </section>

      {/* Projects Section */}
      <section className="max-w-3xl mx-auto px-6 py-12 border-t border-neutral-100 dark:border-neutral-900">
        <h2 className="text-2xl font-semibold mb-8">Open Source Projects</h2>
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 animate-pulse">
                <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full mb-1"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        }>
          <ProjectsSection />
        </Suspense>
        <div className="mt-6 text-center">
          <Link
            href="https://github.com/NeviduJ?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View More on GitHub →
          </Link>
        </div>
      </section>

      {/* Contact Me Section */}
      <section className="max-w-3xl mx-auto px-6 py-12 border-t border-neutral-100 dark:border-neutral-900">
        <h2 className="text-2xl font-semibold mb-8">Contact Me</h2>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="flex items-start gap-4 flex-1">
            <Mail className="w-5 h-5 text-neutral-500 mt-1" />
            <div>
              <h3 className="font-medium mb-1">Email</h3>
              <a
                href="mailto:nevidu.25@cse.mrt.ac.lk"
                className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
              >
                nevidu.25@cse.mrt.ac.lk
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4 flex-1">
            <Linkedin className="w-5 h-5 text-neutral-500 mt-1" />
            <div>
              <h3 className="font-medium mb-1">LinkedIn</h3>
              <a
                href="https://www.linkedin.com/in/nevidu-jayatilleke"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                linkedin.com/in/nevidu-jayatilleke
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-12 border-t border-neutral-100 dark:border-neutral-900 text-center text-sm text-neutral-500">
        <p>© {new Date().getFullYear()} Nevidu Jayatilleke. All rights reserved.</p>
      </footer>
    </main>
  );
}

function SocialLink({ href, icon, label, showLabel }: { href: string; icon: React.ReactNode; label: string; showLabel?: boolean }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center justify-center p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
      aria-label={label}
    >
      {icon}
      {showLabel && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {label}
        </span>
      )}
    </Link>
  );
}
