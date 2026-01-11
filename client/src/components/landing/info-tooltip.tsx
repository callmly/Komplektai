import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface InfoTooltipProps {
  text?: string | null;
  link?: string | null;
  image?: string | null;
}

export function InfoTooltip({ text, link, image }: InfoTooltipProps) {
  if (!text && !link && !image) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ml-1.5 inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          data-testid="button-info-tooltip"
        >
          <Info className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          {image && (
            <img
              src={image}
              alt="Info"
              className="w-full rounded-lg object-cover"
            />
          )}
          {text && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {text}
            </p>
          )}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Sužinoti daugiau
              <span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
