import { useQuery } from "@tanstack/react-query";
import { Package, Settings2, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Plan, Lead } from "@shared/schema";

export default function AdminDashboard() {
  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery<{
    leads: Lead[];
    total: number;
  }>({
    queryKey: ["/api/admin/leads"],
  });

  const isLoading = plansLoading || leadsLoading;

  const totalRevenue =
    leadsData?.leads.reduce((sum, lead) => sum + lead.totalPriceCents, 0) || 0;

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("lt-LT", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const stats = [
    {
      title: "Planai",
      value: plans.length,
      icon: Package,
      description: "Aktyvūs paketai",
    },
    {
      title: "Užklausos",
      value: leadsData?.total || 0,
      icon: Users,
      description: "Visos užklausos",
    },
    {
      title: "Bendra vertė",
      value: `${formatPrice(totalRevenue)} €`,
      icon: TrendingUp,
      description: "Užklausų suma",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Valdymo pultas</h1>
        <p className="text-muted-foreground">
          Sveiki sugrįžę! Čia rasite pagrindinius rodiklius.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Naujausi planai</CardTitle>
            <CardDescription>Jūsų sukurti KNX paketai</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Dar nėra sukurtų planų.
              </p>
            ) : (
              <div className="space-y-2">
                {plans.slice(0, 5).map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">{plan.nameLt}</div>
                      <div className="text-sm text-muted-foreground">
                        {plan.taglineLt}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPrice(plan.basePriceCents)} €
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Naujausios užklausos</CardTitle>
            <CardDescription>Paskutinės gautos užklausos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : !leadsData?.leads.length ? (
              <p className="text-sm text-muted-foreground">
                Dar nėra gautų užklausų.
              </p>
            ) : (
              <div className="space-y-2">
                {leadsData.leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {lead.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPrice(lead.totalPriceCents)} €
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lead.planName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
