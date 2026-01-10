import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Loader2, Save } from "lucide-react";
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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Plan, FeatureGroup, Feature, PlanFeature } from "@shared/schema";

const groupSchema = z.object({
  titleLt: z.string().min(1, "Pavadinimas privalomas"),
  sortOrder: z.coerce.number().default(0),
});

const featureSchema = z.object({
  groupId: z.coerce.number(),
  labelLt: z.string().min(1, "Pavadinimas privalomas"),
  valueType: z.enum(["boolean", "text"]),
  sortOrder: z.coerce.number().default(0),
});

type GroupFormData = z.infer<typeof groupSchema>;
type FeatureFormData = z.infer<typeof featureSchema>;

export default function AdminFeatures() {
  const { toast } = useToast();
  const [editingGroup, setEditingGroup] = useState<FeatureGroup | null>(null);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<FeatureGroup | null>(null);
  const [deletingFeature, setDeletingFeature] = useState<Feature | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [featureValues, setFeatureValues] = useState<
    Map<string, { valueBoolean?: boolean; valueText?: string }>
  >(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  const { data: featuresData, isLoading } = useQuery<{
    groups: FeatureGroup[];
    features: Feature[];
    planFeatures: PlanFeature[];
  }>({
    queryKey: ["/api/features"],
  });

  const groups = featuresData?.groups || [];
  const features = featuresData?.features || [];
  const planFeatures = featuresData?.planFeatures || [];

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [plans]
  );

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [groups]
  );

  const getFeaturesByGroup = (groupId: number) => {
    return features
      .filter((f) => f.groupId === groupId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  const getFeatureValue = (featureId: number, planId: number) => {
    const key = `${featureId}-${planId}`;
    if (featureValues.has(key)) {
      return featureValues.get(key);
    }
    const pf = planFeatures.find(
      (p) => p.featureId === featureId && p.planId === planId
    );
    return pf
      ? { valueBoolean: pf.valueBoolean ?? undefined, valueText: pf.valueText ?? undefined }
      : undefined;
  };

  const updateFeatureValue = (
    featureId: number,
    planId: number,
    value: { valueBoolean?: boolean; valueText?: string }
  ) => {
    const key = `${featureId}-${planId}`;
    setFeatureValues((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
    setHasChanges(true);
  };

  const groupForm = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: { titleLt: "", sortOrder: 0 },
  });

  const featureForm = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      groupId: 0,
      labelLt: "",
      valueType: "boolean",
      sortOrder: 0,
    },
  });

  const saveGroupMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      if (editingGroup) {
        return apiRequest("PATCH", `/api/admin/feature-groups/${editingGroup.id}`, data);
      }
      return apiRequest("POST", "/api/admin/feature-groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/features"] });
      toast({ title: editingGroup ? "Grupė atnaujinta" : "Grupė sukurta" });
      setIsGroupDialogOpen(false);
      setEditingGroup(null);
      groupForm.reset();
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/feature-groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/features"] });
      toast({ title: "Grupė ištrinta" });
      setDeletingGroup(null);
    },
  });

  const saveFeatureMutation = useMutation({
    mutationFn: async (data: FeatureFormData) => {
      if (editingFeature) {
        return apiRequest("PATCH", `/api/admin/features/${editingFeature.id}`, data);
      }
      return apiRequest("POST", "/api/admin/features", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/features"] });
      toast({ title: editingFeature ? "Funkcija atnaujinta" : "Funkcija sukurta" });
      setIsFeatureDialogOpen(false);
      setEditingFeature(null);
      featureForm.reset();
    },
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/features/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/features"] });
      toast({ title: "Funkcija ištrinta" });
      setDeletingFeature(null);
    },
  });

  const saveMatrixMutation = useMutation({
    mutationFn: async () => {
      const updates: { featureId: number; planId: number; valueBoolean?: boolean; valueText?: string }[] = [];
      featureValues.forEach((value, key) => {
        const [featureId, planId] = key.split("-").map(Number);
        updates.push({ featureId, planId, ...value });
      });
      return apiRequest("POST", "/api/admin/plan-features/batch", { updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/features"] });
      toast({ title: "Matrica išsaugota" });
      setFeatureValues(new Map());
      setHasChanges(false);
    },
  });

  const openGroupDialog = (group?: FeatureGroup) => {
    if (group) {
      setEditingGroup(group);
      groupForm.reset({ titleLt: group.titleLt, sortOrder: group.sortOrder || 0 });
    } else {
      setEditingGroup(null);
      groupForm.reset();
    }
    setIsGroupDialogOpen(true);
  };

  const openFeatureDialog = (groupId: number, feature?: Feature) => {
    if (feature) {
      setEditingFeature(feature);
      featureForm.reset({
        groupId: feature.groupId,
        labelLt: feature.labelLt,
        valueType: feature.valueType as "boolean" | "text",
        sortOrder: feature.sortOrder || 0,
      });
    } else {
      setEditingFeature(null);
      featureForm.reset({
        groupId,
        labelLt: "",
        valueType: "boolean",
        sortOrder: 0,
      });
    }
    setIsFeatureDialogOpen(true);
  };

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funkcijų lentelė</h1>
          <p className="text-muted-foreground">
            Valdykite palyginimo lentelės funkcijas
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button
              onClick={() => saveMatrixMutation.mutate()}
              disabled={saveMatrixMutation.isPending}
            >
              {saveMatrixMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Išsaugoti matricą
            </Button>
          )}
          <Button onClick={() => openGroupDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Pridėti grupę
          </Button>
        </div>
      </div>

      {sortedGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">
              Dar nėra sukurtų funkcijų grupių
            </p>
            <Button onClick={() => openGroupDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Sukurti pirmą grupę
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map((group) => {
            const groupFeatures = getFeaturesByGroup(group.id);
            return (
              <Card key={group.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle>{group.titleLt}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openFeatureDialog(group.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Funkcija
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openGroupDialog(group)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingGroup(group)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {groupFeatures.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">
                      Nėra funkcijų
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left font-medium">
                              Funkcija
                            </th>
                            {sortedPlans.map((plan) => (
                              <th
                                key={plan.id}
                                className="px-4 py-2 text-center font-medium"
                              >
                                {plan.nameLt}
                              </th>
                            ))}
                            <th className="w-20"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupFeatures.map((feature) => (
                            <tr key={feature.id} className="border-b">
                              <td className="px-4 py-3 font-medium">
                                {feature.labelLt}
                              </td>
                              {sortedPlans.map((plan) => {
                                const value = getFeatureValue(feature.id, plan.id);
                                return (
                                  <td
                                    key={plan.id}
                                    className="px-4 py-3 text-center"
                                  >
                                    {feature.valueType === "boolean" ? (
                                      <Switch
                                        checked={value?.valueBoolean ?? false}
                                        onCheckedChange={(checked) =>
                                          updateFeatureValue(feature.id, plan.id, {
                                            valueBoolean: checked,
                                          })
                                        }
                                      />
                                    ) : (
                                      <Input
                                        className="h-8 w-24"
                                        value={value?.valueText ?? ""}
                                        onChange={(e) =>
                                          updateFeatureValue(feature.id, plan.id, {
                                            valueText: e.target.value,
                                          })
                                        }
                                        placeholder="-"
                                      />
                                    )}
                                  </td>
                                );
                              })}
                              <td className="px-2">
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      openFeatureDialog(group.id, feature)
                                    }
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingFeature(feature)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Redaguoti grupę" : "Nauja grupė"}
            </DialogTitle>
          </DialogHeader>
          <Form {...groupForm}>
            <form
              onSubmit={groupForm.handleSubmit((data) =>
                saveGroupMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <FormField
                control={groupForm.control}
                name="titleLt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pavadinimas *</FormLabel>
                    <FormControl>
                      <Input placeholder="Aparatūra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={groupForm.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rikiavimo eilė</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGroupDialogOpen(false)}
                >
                  Atšaukti
                </Button>
                <Button type="submit" disabled={saveGroupMutation.isPending}>
                  {saveGroupMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Išsaugoti
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFeature ? "Redaguoti funkciją" : "Nauja funkcija"}
            </DialogTitle>
          </DialogHeader>
          <Form {...featureForm}>
            <form
              onSubmit={featureForm.handleSubmit((data) =>
                saveFeatureMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <FormField
                control={featureForm.control}
                name="labelLt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pavadinimas *</FormLabel>
                    <FormControl>
                      <Input placeholder="KNX aktuatorius" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={featureForm.control}
                name="valueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reikšmės tipas</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="boolean">Taip/Ne</SelectItem>
                        <SelectItem value="text">Tekstas</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={featureForm.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rikiavimo eilė</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFeatureDialogOpen(false)}
                >
                  Atšaukti
                </Button>
                <Button type="submit" disabled={saveFeatureMutation.isPending}>
                  {saveFeatureMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Išsaugoti
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ištrinti grupę?</AlertDialogTitle>
            <AlertDialogDescription>
              Bus ištrintos visos grupės funkcijos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Atšaukti</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingGroup && deleteGroupMutation.mutate(deletingGroup.id)
              }
              className="bg-destructive text-destructive-foreground"
            >
              Ištrinti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingFeature}
        onOpenChange={(open) => !open && setDeletingFeature(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ištrinti funkciją?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Atšaukti</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingFeature && deleteFeatureMutation.mutate(deletingFeature.id)
              }
              className="bg-destructive text-destructive-foreground"
            >
              Ištrinti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
