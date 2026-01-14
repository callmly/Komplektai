import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { FooterLink } from "@shared/schema";

const linkSchema = z.object({
  labelLt: z.string().min(1, "Pavadinimas privalomas"),
  url: z.string().min(1, "Nuoroda privaloma"),
  openInNewTab: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

type LinkFormData = z.infer<typeof linkSchema>;

export default function AdminFooterLinks() {
  const { toast } = useToast();
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [deletingLink, setDeletingLink] = useState<FooterLink | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: links = [], isLoading } = useQuery<FooterLink[]>({
    queryKey: ["/api/admin/footer-links"],
  });

  const sortedLinks = [...links].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      labelLt: "",
      url: "",
      openInNewTab: false,
      isActive: true,
      sortOrder: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: LinkFormData) => {
      const res = await apiRequest("POST", "/api/admin/footer-links", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/footer-links"] });
      toast({ title: "Nuoroda sukurta" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (err: Error) => {
      toast({ title: "Klaida", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LinkFormData> }) => {
      const res = await apiRequest("PATCH", `/api/admin/footer-links/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/footer-links"] });
      toast({ title: "Nuoroda atnaujinta" });
      setIsDialogOpen(false);
      setEditingLink(null);
      form.reset();
    },
    onError: (err: Error) => {
      toast({ title: "Klaida", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/footer-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/footer-links"] });
      toast({ title: "Nuoroda ištrinta" });
      setDeletingLink(null);
    },
    onError: (err: Error) => {
      toast({ title: "Klaida", description: err.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/footer-links/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/footer-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/footer-links"] });
    },
    onError: (err: Error) => {
      toast({ title: "Klaida", description: err.message, variant: "destructive" });
    },
  });

  const openCreateDialog = () => {
    setEditingLink(null);
    form.reset({
      labelLt: "",
      url: "",
      openInNewTab: false,
      isActive: true,
      sortOrder: links.length,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (link: FooterLink) => {
    setEditingLink(link);
    form.reset({
      labelLt: link.labelLt,
      url: link.url,
      openInNewTab: link.openInNewTab ?? false,
      isActive: link.isActive ?? true,
      sortOrder: link.sortOrder ?? 0,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: LinkFormData) => {
    if (editingLink) {
      updateMutation.mutate({ id: editingLink.id, data });
    } else {
      createMutation.mutate(data);
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
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Footer nuorodos</h1>
          <p className="text-muted-foreground">
            Valdykite apačios meniu nuorodas (pvz. Privatumo politika)
          </p>
        </div>
        <Button onClick={openCreateDialog} data-testid="button-create-footer-link">
          <Plus className="w-4 h-4 mr-2" />
          Pridėti nuorodą
        </Button>
      </div>

      {sortedLinks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nėra sukurtų footer nuorodų. Pridėkite pirmą nuorodą.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sortedLinks.map((link) => (
            <Card key={link.id} className={!link.isActive ? "opacity-60" : ""}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{link.labelLt}</span>
                    {link.openInNewTab && (
                      <Badge variant="outline" className="text-xs">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Naujame lange
                      </Badge>
                    )}
                    {!link.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Neaktyvi
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActiveMutation.mutate({ id: link.id, isActive: !link.isActive })}
                    data-testid={`button-toggle-footer-link-${link.id}`}
                  >
                    {link.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(link)}
                    data-testid={`button-edit-footer-link-${link.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingLink(link)}
                    data-testid={`button-delete-footer-link-${link.id}`}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Redaguoti nuorodą" : "Nauja nuoroda"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="labelLt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pavadinimas</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Privatumo politika" data-testid="input-footer-link-label" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuoroda (URL)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="/privatumo-politika arba https://..." data-testid="input-footer-link-url" />
                    </FormControl>
                    <FormDescription>
                      Įveskite vidinę nuorodą (/puslapis) arba išorinę (https://...)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="openInNewTab"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Atidaryti naujame lange</FormLabel>
                      <FormDescription>
                        Nuoroda atsidarys naujame naršyklės lange
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-footer-link-new-tab"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rikiavimo tvarka</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-footer-link-order" />
                    </FormControl>
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
                      <FormLabel>Aktyvi</FormLabel>
                      <FormDescription>
                        Rodyti nuorodą footer srityje
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-footer-link-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Atšaukti
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-footer-link">
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingLink ? "Išsaugoti" : "Sukurti"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ištrinti nuorodą?</AlertDialogTitle>
            <AlertDialogDescription>
              Ar tikrai norite ištrinti nuorodą "{deletingLink?.labelLt}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Atšaukti</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingLink && deleteMutation.mutate(deletingLink.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-footer-link"
            >
              Ištrinti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
