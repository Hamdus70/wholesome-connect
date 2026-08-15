import { Link } from "@tanstack/react-router";
import { Activity, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="bg-hero-gradient flex size-9 items-center justify-center rounded-xl text-primary-foreground">
            <Activity className="size-5" />
          </span>
          <span className="font-display text-[1.05rem] leading-tight font-extrabold">
            Wholesome<span className="text-accent"> Health</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#specialists" className="transition-colors hover:text-foreground">
            Find a specialist
          </a>
          <a href="#intake" className="transition-colors hover:text-foreground">
            Multilingual intake
          </a>
          <a href="#network" className="transition-colors hover:text-foreground">
            Lab &amp; pharmacy network
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/emr">
              <Stethoscope className="size-4" />
              <span className="hidden sm:inline">Clinician portal</span>
              <span className="sm:hidden">EMR</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#specialists">Book consultation</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
