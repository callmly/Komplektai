import { useMemo, Fragment } from "react";
import { Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "@/components/ui/animated-section";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./info-tooltip";
import type { Plan, FeatureGroup, Feature, PlanFeature } from "@shared/schema";

interface FeatureComparisonProps {
  plans: Plan[];
  featureGroups: FeatureGroup[];
  features: Feature[];
  planFeatures: PlanFeature[];
  isLoading: boolean;
}

export function FeatureComparison({
  plans,
  featureGroups,
  features,
  planFeatures,
  isLoading,
}: FeatureComparisonProps) {
  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [plans]
  );

  const sortedGroups = useMemo(
    () => [...featureGroups].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [featureGroups]
  );

  const getFeatureValue = (featureId: number, planId: number) => {
    const pf = planFeatures.find(
      (p) => p.featureId === featureId && p.planId === planId
    );
    return pf;
  };

  const getFeaturesByGroup = (groupId: number) => {
    return features
      .filter((f) => f.groupId === groupId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  if (isLoading) {
    return (
      <section id="features" className="border-t bg-muted/30 py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <Skeleton className="mx-auto mb-4 h-10 w-80" />
            <Skeleton className="mx-auto h-6 w-96" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </section>
    );
  }

  if (sortedGroups.length === 0 || sortedPlans.length === 0) {
    return null;
  }

  return (
    <section id="features" className="border-t bg-muted/30 py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
            Palyginti visas funkcijas
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Išsami paketų palyginimo lentelė padės pasirinkti tinkamiausią
            sprendimą jūsų namams.
          </p>
        </AnimatedSection>

        {/* Desktop Table */}
        <AnimatedSection delay={100} className="hidden overflow-hidden rounded-xl border bg-background lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="sticky left-0 z-10 bg-muted/50 px-6 py-4 text-left font-semibold">
                    Funkcija
                  </th>
                  {sortedPlans.map((plan) => (
                    <th
                      key={plan.id}
                      className={cn(
                        "w-1/4 px-6 py-4 text-center font-semibold",
                        plan.isHighlighted && "bg-primary/5"
                      )}
                    >
                      {plan.nameLt}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedGroups.map((group, groupIdx) => (
                  <Fragment key={`group-${group.id}`}>
                    <tr className="border-b bg-muted/30">
                      <td
                        colSpan={sortedPlans.length + 1}
                        className="px-6 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        <span className="inline-flex items-center">
                          {group.titleLt}
                          {group.tooltipEnabled && (
                            <InfoTooltip
                              text={group.tooltipText}
                              link={group.tooltipLink}
                              image={group.tooltipImage}
                            />
                          )}
                        </span>
                      </td>
                    </tr>
                    {getFeaturesByGroup(group.id).map((feature, featureIdx) => (
                      <tr
                        key={feature.id}
                        className={cn(
                          "border-b transition-colors",
                          featureIdx % 2 === 0 ? "bg-background" : "bg-muted/10"
                        )}
                      >
                        <td className="sticky left-0 z-10 bg-inherit px-6 py-4 font-medium">
                          <span className="inline-flex items-center">
                            {feature.labelLt}
                            {feature.tooltipEnabled && (
                              <InfoTooltip
                                text={feature.tooltipText}
                                link={feature.tooltipLink}
                                image={feature.tooltipImage}
                              />
                            )}
                          </span>
                        </td>
                        {sortedPlans.map((plan) => {
                          const value = getFeatureValue(feature.id, plan.id);
                          return (
                            <td
                              key={plan.id}
                              className={cn(
                                "px-6 py-4 text-center",
                                plan.isHighlighted && "bg-primary/5"
                              )}
                            >
                              {feature.valueType === "boolean" ? (
                                value?.valueBoolean ? (
                                  <Check className="mx-auto h-5 w-5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <X className="mx-auto h-5 w-5 text-muted-foreground/40" />
                                )
                              ) : (
                                <span className="text-sm">
                                  {value?.valueText || "-"}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedSection>

        {/* Mobile Accordion */}
        <AnimatedSection delay={100} className="lg:hidden">
          <Accordion type="single" collapsible className="space-y-4">
            {sortedGroups.map((group) => (
              <AccordionItem
                key={group.id}
                value={`group-${group.id}`}
                className="rounded-xl border bg-background px-4"
              >
                <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">
                  <span className="inline-flex items-center">
                    {group.titleLt}
                    {group.tooltipEnabled && (
                      <InfoTooltip
                        text={group.tooltipText}
                        link={group.tooltipLink}
                        image={group.tooltipImage}
                      />
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-4">
                    {getFeaturesByGroup(group.id).map((feature) => (
                      <div
                        key={feature.id}
                        className="rounded-lg border bg-muted/20 p-4"
                      >
                        <div className="mb-3 font-medium inline-flex items-center">
                          {feature.labelLt}
                          {feature.tooltipEnabled && (
                            <InfoTooltip
                              text={feature.tooltipText}
                              link={feature.tooltipLink}
                              image={feature.tooltipImage}
                            />
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {sortedPlans.map((plan) => {
                            const value = getFeatureValue(feature.id, plan.id);
                            return (
                              <div
                                key={plan.id}
                                className={cn(
                                  "flex flex-col items-center gap-1 rounded-lg p-2 text-center",
                                  plan.isHighlighted
                                    ? "bg-primary/10"
                                    : "bg-muted/30"
                                )}
                              >
                                <span className="text-xs font-medium text-muted-foreground">
                                  {plan.nameLt}
                                </span>
                                {feature.valueType === "boolean" ? (
                                  value?.valueBoolean ? (
                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <X className="h-5 w-5 text-muted-foreground/40" />
                                  )
                                ) : (
                                  <span className="text-sm font-medium">
                                    {value?.valueText || "-"}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
}
