import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomPage } from "@shared/schema";

export default function CustomPageView() {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug || "";

  const { data: page, isLoading, error } = useQuery<CustomPage>({
    queryKey: ["/api/pages", slug],
    enabled: !!slug,
  });

  useEffect(() => {
    if (page?.titleLt) {
      document.title = `${page.titleLt} | KNX Smart Home`;
    }
    return () => {
      document.title = "KNX Smart Home";
    };
  }, [page?.titleLt]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Puslapis nerastas</h1>
        <p className="text-muted-foreground">Ieškomas puslapis neegzistuoja.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Grįžti į pradžią
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center px-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Grįžti
              </Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 lg:px-8">
          <article className="mx-auto max-w-3xl">
            <h1 className="mb-8 text-3xl font-bold" data-testid="text-page-title">
              {page.titleLt}
            </h1>
            
            {page.isHtml ? (
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: page.contentLt || "" }}
                data-testid="page-content-html"
              />
            ) : (
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap"
                data-testid="page-content-text"
              >
                {page.contentLt}
              </div>
            )}
          </article>
        </main>
      </div>
    </>
  );
}
