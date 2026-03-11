import { Github } from "lucide-react";

export function Header() {
  return (
    <header className="shrink-0 bg-background">
      <div className="container max-w-6xl py-6">
        <div className="flex items-center gap-3 mb-1">
          <a
            href="/"
            aria-label="PicPeek home"
            className="relative z-10 h-12 w-12 shrink-0 rounded-lg bg-primary flex items-center justify-center cursor-pointer select-none touch-manipulation active:scale-95 transition-transform"
          >
            <img
              src="/picpeek.png"
              className="rounded-md pointer-events-none"
              alt="PicPeek"
              width={40}
              height={40}
            />
          </a>

          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              PicPeek
            </h1>
            <p className="text-muted-foreground text-sm">
              Compare up to 9 images side by side — paste a URL or upload files.
            </p>
          </div>

          <a
            href="https://github.com/YeLwinOo-Steve/pic-peek"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-primary hover:text-white hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="View PicPeek on GitHub"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">View on GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
