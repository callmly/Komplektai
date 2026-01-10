import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SiteContent } from "@shared/schema";

interface HeaderProps {
  content?: SiteContent;
}

export function Header({ content }: HeaderProps) {
  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {content?.headingLt || "KNX Smart Home"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={scrollToPlans} data-testid="button-hero-cta">
            {content?.ctaLabelLt || "Pasirinkti planą"}
          </Button>
        </div>
      </div>
    </header>
  );
}
