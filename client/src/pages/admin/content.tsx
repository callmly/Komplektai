import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SiteContent } from "@shared/schema";

const contentKeys = [
  { key: "header", title: "Antraštė", description: "Navigacijos juosta" },
  { key: "hero", title: "Hero sekcija", description: "Pagrindinis skyrius" },
  { key: "contact", title: "Kontaktai", description: "Kontaktinė informacija" },
  { key: "footer", title: "Poraštė", description: "Apatinis skyrius" },
  { key: "thankYou", title: "Padėka", description: "Pranešimas po užklausos pateikimo" },
];

export default function AdminContent() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("header");

  const { data: contents = [], isLoading } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContentByKey = (key: string) => {
    return contents.find((c) => c.key === key);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Svetainės turinys</h1>
        <p className="text-muted-foreground">
          Redaguokite svetainės tekstus lietuvių kalba
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {contentKeys.map((item) => (
            <TabsTrigger key={item.key} value={item.key}>
              {item.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {contentKeys.map((item) => (
          <TabsContent key={item.key} value={item.key}>
            <ContentForm
              contentKey={item.key}
              title={item.title}
              description={item.description}
              content={getContentByKey(item.key)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ContentForm({
  contentKey,
  title,
  description,
  content,
}: {
  contentKey: string;
  title: string;
  description: string;
  content?: SiteContent;
}) {
  const { toast } = useToast();
  const [headingLt, setHeadingLt] = useState(content?.headingLt || "");
  const [bodyLt, setBodyLt] = useState(content?.bodyLt || "");
  const [ctaLabelLt, setCtaLabelLt] = useState(content?.ctaLabelLt || "");
  const [mediaUrl, setMediaUrl] = useState(content?.mediaUrl || "");

  useEffect(() => {
    setHeadingLt(content?.headingLt || "");
    setBodyLt(content?.bodyLt || "");
    setCtaLabelLt(content?.ctaLabelLt || "");
    setMediaUrl(content?.mediaUrl || "");
  }, [content]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/admin/site-content/${contentKey}`, {
        key: contentKey,
        headingLt,
        bodyLt,
        ctaLabelLt,
        mediaUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({ title: "Turinys išsaugotas" });
    },
    onError: () => {
      toast({ title: "Klaida", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${contentKey}-heading`}>Antraštė</Label>
          <Input
            id={`${contentKey}-heading`}
            value={headingLt}
            onChange={(e) => setHeadingLt(e.target.value)}
            placeholder="Pagrindinė antraštė..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${contentKey}-body`}>Tekstas</Label>
          <Textarea
            id={`${contentKey}-body`}
            value={bodyLt}
            onChange={(e) => setBodyLt(e.target.value)}
            placeholder="Pagrindinis tekstas..."
            rows={4}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${contentKey}-cta`}>CTA mygtukas</Label>
            <Input
              id={`${contentKey}-cta`}
              value={ctaLabelLt}
              onChange={(e) => setCtaLabelLt(e.target.value)}
              placeholder="Mygtuko tekstas..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${contentKey}-media`}>Nuotraukos URL</Label>
            <Input
              id={`${contentKey}-media`}
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Išsaugoti
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
