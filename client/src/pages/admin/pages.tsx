import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, FileText, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CustomPage } from "@shared/schema";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

const pageSchema = z.object({
  titleLt: z.string().min(1, "Pavadinimas privalomas"),
  slug: z.string().min(1, "Nuorodos kelias privalomas"),
  contentLt: z.string().optional(),
  isHtml: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type PageFormData = z.infer<typeof pageSchema>;

export default function AdminPages() {
  const { toast } = useToast();
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [deletingPage, setDeletingPage] = useState<CustomPage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: pages = [], isLoading } = useQuery<CustomPage[]>({
    queryKey: ["/api/admin/pages"],
  });

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      titleLt: "",
      slug: "",
      contentLt: "",
      isHtml: false,
      isActive: true,
    },
  });

  const watchTitle = form.watch("titleLt");
  const watchIsHtml = form.watch("isHtml");

  const createMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      const res = await apiRequest("POST", "/api/admin/pages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "Puslapis sukurtas" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (err: Error) => {
      toast({ title: "Klaida", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PageFormData> }) => {
      const res = await apiRequest("PATCH", `/api/admin/pages/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "Puslapis atnaujintas" });
      setIsDialogOpen(false);
      setEditingPage(null);
      form.reset();
    },
    onError: (err: Error) => {
      toast({ title: "Klaida", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "Puslapis ištrintas" });
      setDeletingPage(null);
    },
    onError: (err: Error) => {
      toast({ title: "Klaida", description: err.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/pages/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
    },
    onError: (err: Error) => {
      toast({ title: "Klaida", description: err.message, variant: "destructive" });
    },
  });

  const openCreateDialog = () => {
    setEditingPage(null);
    form.reset({
      titleLt: "",
      slug: "",
      contentLt: "",
      isHtml: false,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (page: CustomPage) => {
    setEditingPage(page);
    form.reset({
      titleLt: page.titleLt,
      slug: page.slug,
      contentLt: page.contentLt || "",
      isHtml: page.isHtml ?? false,
      isActive: page.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: PageFormData) => {
    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleTitleBlur = () => {
    if (!editingPage && watchTitle && !form.getValues("slug")) {
      form.setValue("slug", slugify(watchTitle));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Puslapiai</h1>
          <p className="text-muted-foreground">
            Valdykite papildomus puslapius (pvz. Privatumo politika)
          </p>
        </div>
        <Button onClick={openCreateDialog} data-testid="button-create-page">
          <Plus className="w-4 h-4 mr-2" />
          Naujas puslapis
        </Button>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nėra sukurtų puslapių. Sukurkite pirmą puslapį.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {pages.map((page) => (
            <Card key={page.id} className={!page.isActive ? "opacity-60" : ""}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{page.titleLt}</span>
                    {page.isHtml ? (
                      <Badge variant="outline" className="text-xs">
                        <Code className="w-3 h-3 mr-1" />
                        HTML
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Tekstas
                      </Badge>
                    )}
                    {!page.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Neaktyvus
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActiveMutation.mutate({ id: page.id, isActive: !page.isActive })}
                    data-testid={`button-toggle-page-${page.id}`}
                  >
                    {page.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(page)}
                    data-testid={`button-edit-page-${page.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingPage(page)}
                    data-testid={`button-delete-page-${page.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? "Redaguoti puslapį" : "Naujas puslapis"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="titleLt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pavadinimas</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Privatumo politika" 
                        onBlur={handleTitleBlur}
                        data-testid="input-page-title" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuorodos kelias</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="privatumo-politika" data-testid="input-page-slug" />
                    </FormControl>
                    <FormDescription>
                      Puslapis bus pasiekiamas adresu: /{field.value || "kelias"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isHtml"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>HTML turinys</FormLabel>
                      <FormDescription>
                        Įjunkite jei turinys yra HTML kodas
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-page-html"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contentLt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{watchIsHtml ? "HTML turinys" : "Turinys"}</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={12}
                        className="font-mono text-sm"
                        placeholder={watchIsHtml 
                          ? "<h1>Pavadinimas</h1>\n<p>Turinys...</p>" 
                          : "Puslapio turinys..."
                        }
                        data-testid="input-page-content" 
                      />
                    </FormControl>
                    <FormDescription>
                      {watchIsHtml 
                        ? "Galite naudoti HTML žymes turinio formatavimui" 
                        : "Paprastas tekstas be formatavimo"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Aktyvus</FormLabel>
                      <FormDescription>
                        Puslapis bus viešai pasiekiamas
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-page-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Atšaukti
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-page">
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingPage ? "Išsaugoti" : "Sukurti"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingPage} onOpenChange={(open) => !open && setDeletingPage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ištrinti puslapį?</AlertDialogTitle>
            <AlertDialogDescription>
              Ar tikrai norite ištrinti puslapį "{deletingPage?.titleLt}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Atšaukti</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPage && deleteMutation.mutate(deletingPage.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-page"
            >
              Ištrinti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
