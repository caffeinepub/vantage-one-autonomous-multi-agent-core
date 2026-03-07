import { Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-12 items-center justify-center">
        <p className="text-xs font-mono text-muted-foreground/60">
          © {year} Vantage One · Built with{" "}
          <Heart className="inline h-3 w-3 fill-rose-500/80 text-rose-500/80" />{" "}
          using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
