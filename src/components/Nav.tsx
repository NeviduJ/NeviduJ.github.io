import Link from "next/link";
import Clock from "./Clock";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { label: "About", href: "/#about", className: "hidden sm:inline" },
  { label: "Publications", href: "/#publications" },
  { label: "Projects", href: "/#projects" },
  { label: "Contact", href: "/#contact", className: "hidden sm:inline" },
  { label: "CV", href: "/resume" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 font-mono text-[10px] uppercase tracking-[0.12em] sm:gap-6 sm:px-6 sm:text-[11px] sm:tracking-[0.18em]">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <span className="grid h-7 w-7 place-items-center bg-accent font-serif text-lg normal-case tracking-normal text-accent-ink">
            N
          </span>
          <span className="hidden md:inline">Nevidu Jayatilleke</span>
        </Link>
        <div className="flex items-center gap-3 text-muted sm:gap-5">
          {LINKS.map((link) => (
            <Link key={link.label} href={link.href} className={`transition-colors hover:text-accent ${link.className ?? ""}`}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-2 text-muted lg:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Colombo <Clock />
          </div>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
