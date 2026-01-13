import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Save, Globe, Search, Share2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SeoSettings } from "@shared/schema";

export default function AdminSeo() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("meta");

  const { data: settings, isLoading } = useQuery<SeoSettings>({
    queryKey: ["/api/admin/seo-settings"],
  });

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [googleAnalyticsScript, setGoogleAnalyticsScript] = useState("");
  const [customHeadCode, setCustomHeadCode] = useState("");
  const [robotsTxt, setRobotsTxt] = useState("");

  useEffect(() => {
    if (settings) {
      setMetaTitle(settings.metaTitle || "");
      setMetaDescription(settings.metaDescription || "");
      setMetaKeywords(settings.metaKeywords || "");
      setOgTitle(settings.ogTitle || "");
      setOgDescription(settings.ogDescription || "");
      setOgImage(settings.ogImage || "");
      setGoogleAnalyticsId(settings.googleAnalyticsId || "");
      setGoogleAnalyticsScript(settings.googleAnalyticsScript || "");
      setCustomHeadCode(settings.customHeadCode || "");
      setRobotsTxt(settings.robotsTxt || "");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/admin/seo-settings", {
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        googleAnalyticsId: googleAnalyticsId || null,
        googleAnalyticsScript: googleAnalyticsScript || null,
        customHeadCode: customHeadCode || null,
        robotsTxt: robotsTxt || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seo-settings"] });
      toast({ title: "SEO nustatymai išsaugoti" });
    },
    onError: () => {
      toast({ title: "Klaida išsaugant", variant: "destructive" });
    },
  });

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
        <h1 className="text-2xl font-bold tracking-tight">SEO nustatymai</h1>
        <p className="text-muted-foreground">
          Valdykite paieškos optimizavimą ir analitiką
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="meta" className="gap-2">
            <Search className="h-4 w-4" />
            Meta žymos
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" />
            Socialiniai tinklai
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Globe className="h-4 w-4" />
            Analitika
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Code className="h-4 w-4" />
            Išplėstiniai
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meta">
          <Card>
            <CardHeader>
              <CardTitle>Meta žymos</CardTitle>
              <CardDescription>
                Šios žymos padeda paieškos sistemoms suprasti jūsų svetainės turinį
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Puslapio pavadinimas (Title)</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="KNX Išmani Namų Automatizacija | Lietuva"
                  maxLength={70}
                  data-testid="input-meta-title"
                />
                <p className="text-xs text-muted-foreground">
                  {metaTitle.length}/70 simbolių. Rekomenduojama 50-60 simbolių.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta aprašymas (Description)</Label>
                <Textarea
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Profesionali KNX namų automatizacija Lietuvoje. Apšvietimas, šildymas, žaliuzės - viskas valdoma iš vienos sistemos."
                  rows={3}
                  maxLength={160}
                  data-testid="input-meta-description"
                />
                <p className="text-xs text-muted-foreground">
                  {metaDescription.length}/160 simbolių. Rekomenduojama 120-155 simbolių.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-keywords">Raktiniai žodžiai (Keywords)</Label>
                <Textarea
                  id="meta-keywords"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="KNX, išmanus namas, namų automatizacija, Lietuva, apšvietimo valdymas"
                  rows={2}
                  data-testid="input-meta-keywords"
                />
                <p className="text-xs text-muted-foreground">
                  Atskirkite raktažodžius kableliais
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Open Graph (socialiniai tinklai)</CardTitle>
              <CardDescription>
                Kaip jūsų svetainė atrodo dalijantis Facebook, LinkedIn ir kt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="og-title">OG pavadinimas</Label>
                <Input
                  id="og-title"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="KNX Išmani Namų Automatizacija"
                  data-testid="input-og-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-description">OG aprašymas</Label>
                <Textarea
                  id="og-description"
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder="Profesionali namų automatizacija su KNX technologija"
                  rows={2}
                  data-testid="input-og-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-image">OG paveikslėlio URL</Label>
                <Input
                  id="og-image"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://jusu-svetaine.lt/og-image.jpg"
                  data-testid="input-og-image"
                />
                <p className="text-xs text-muted-foreground">
                  Rekomenduojamas dydis: 1200x630 pikselių
                </p>
              </div>

              {ogImage && (
                <div className="mt-4 rounded-lg border p-4">
                  <p className="mb-2 text-sm font-medium">Peržiūra:</p>
                  <img
                    src={ogImage}
                    alt="OG preview"
                    className="max-h-48 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Google Analytics</CardTitle>
              <CardDescription>
                Stebėkite lankytojų srautą ir elgseną
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ga-id">Google Analytics ID</Label>
                <Input
                  id="ga-id"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="G-XXXXXXXXXX arba UA-XXXXXXXXX-X"
                  data-testid="input-ga-id"
                />
                <p className="text-xs text-muted-foreground">
                  Įveskite savo Google Analytics matavimo ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ga-script">Arba pilnas GA kodas</Label>
                <Textarea
                  id="ga-script"
                  value={googleAnalyticsScript}
                  onChange={(e) => setGoogleAnalyticsScript(e.target.value)}
                  placeholder="<!-- Google tag (gtag.js) -->&#10;<script async src=..."
                  rows={8}
                  className="font-mono text-sm"
                  data-testid="input-ga-script"
                />
                <p className="text-xs text-muted-foreground">
                  Jei turite pilną GA kodą, įklijuokite čia. Kitaip užtenka tik ID.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Papildomas HEAD kodas</CardTitle>
                <CardDescription>
                  Bet koks kodas, kurį norite įterpti į {"<head>"} sekciją
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={customHeadCode}
                  onChange={(e) => setCustomHeadCode(e.target.value)}
                  placeholder="<meta name='verification' content='xxx' />&#10;<link rel='canonical' href='...' />"
                  rows={6}
                  className="font-mono text-sm"
                  data-testid="input-custom-head"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>robots.txt turinys</CardTitle>
                <CardDescription>
                  Kontroliuokite, ką paieškos robotai gali indeksuoti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  placeholder="User-agent: *&#10;Allow: /&#10;&#10;Sitemap: https://jusu-svetaine.lt/sitemap.xml"
                  rows={6}
                  className="font-mono text-sm"
                  data-testid="input-robots-txt"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Palikite tuščią, kad būtų naudojamas numatytasis robots.txt
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          size="lg"
          data-testid="button-save-seo"
        >
          {saveMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Išsaugoti SEO nustatymus
        </Button>
      </div>
    </div>
  );
}
