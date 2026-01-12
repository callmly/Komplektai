import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Plan, Option, OptionGroup, SiteContent } from "@shared/schema";
import type { PlanConfig } from "@/pages/landing";

const formSchema = z.object({
  name: z.string().min(2, "Vardas per trumpas"),
  email: z.string().email("Neteisingas el. pašto formatas"),
  phone: z.string().optional(),
  city: z.string().min(2, "Įveskite miestą arba objektą"),
  comment: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  config: PlanConfig | null;
  options: Option[];
  optionGroups: OptionGroup[];
  thankYouContent?: SiteContent;
}

export function LeadModal({
  isOpen,
  onClose,
  plan,
  config,
  options,
  optionGroups,
  thankYouContent,
}: LeadModalProps) {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      comment: "",
    },
  });

  const selectedOptionsData = useMemo(() => {
    if (!config) return [];
    return config.selectedOptions.map((sel) => {
      const option = options.find((o) => o.id === sel.optionId);
      return {
        ...sel,
        option,
        totalPrice: option ? option.unitPriceCents * sel.quantity : 0,
      };
    });
  }, [config, options]);

  const totalPrice = useMemo(() => {
    if (!plan) return 0;
    let total = plan.basePriceCents;
    selectedOptionsData.forEach((sel) => {
      total += sel.totalPrice;
    });
    return total;
  }, [plan, selectedOptionsData]);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("lt-LT", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        planId: plan?.id,
        selectedOptions: config?.selectedOptions || [],
      };
      return apiRequest("POST", "/api/leads", payload);
    },
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: () => {
      toast({
        title: "Klaida",
        description: "Nepavyko išsiųsti užklausos. Bandykite dar kartą.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setShowSuccess(false);
    form.reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  if (!plan || !config) return null;

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md text-center">
          <div className="flex flex-col items-center py-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {thankYouContent?.headingLt || "Ačiū už užklausą!"}
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {thankYouContent?.bodyLt || "Su jumis susisieksime artimiausiu metu."}
              </DialogDescription>
            </DialogHeader>
            <Button className="mt-6" onClick={handleClose} data-testid="button-thank-you-close">
              {thankYouContent?.ctaLabelLt || "Uždaryti"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gauti pasiūlymą</DialogTitle>
          <DialogDescription>
            Užpildykite formą ir mes susisieksime su jumis per 24 valandas.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6 rounded-lg bg-muted/50 p-4">
          <h3 className="mb-3 font-semibold">Jūsų pasirinkimas</h3>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium">{plan.nameLt}</span>
            <span className="text-sm text-muted-foreground">
              Bazinė kaina: {formatPrice(plan.basePriceCents)} €
            </span>
          </div>

          {selectedOptionsData.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              {selectedOptionsData.map((sel) => (
                <div
                  key={sel.optionId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {sel.option?.labelLt}{" "}
                    {sel.quantity > 1 && `× ${sel.quantity}`}
                  </span>
                  <span className="text-muted-foreground">
                    +{formatPrice(sel.totalPrice)} €
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-lg font-semibold">Bendra kaina:</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(totalPrice)} €
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vardas *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jūsų vardas"
                        {...field}
                        data-testid="input-lead-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>El. paštas *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jusu@pastas.lt"
                        {...field}
                        data-testid="input-lead-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefonas</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+370 6XX XXXXX"
                        {...field}
                        data-testid="input-lead-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Miestas / Objektas *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vilnius"
                        {...field}
                        data-testid="input-lead-city"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Komentaras</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Papildoma informacija apie jūsų projektą..."
                      rows={4}
                      {...field}
                      data-testid="textarea-lead-comment"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-testid="button-lead-cancel"
              >
                Atšaukti
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                data-testid="button-lead-submit"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Siunčiama...
                  </>
                ) : (
                  "Siųsti užklausą"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
