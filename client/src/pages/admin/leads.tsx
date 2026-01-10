import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { Download, Eye, Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Lead, SelectedOptionData } from "@shared/schema";

export default function AdminLeads() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leadsData, isLoading } = useQuery<{
    leads: Lead[];
    total: number;
  }>({
    queryKey: ["/api/admin/leads"],
  });

  const leads = leadsData?.leads || [];

  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.city?.toLowerCase().includes(query) ||
      lead.planName?.toLowerCase().includes(query)
    );
  });

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("lt-LT", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleExportCSV = () => {
    const headers = ["Vardas", "El. paštas", "Telefonas", "Miestas", "Planas", "Kaina", "Data"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone || "",
      lead.city || "",
      lead.planName || "",
      formatPrice(lead.totalPriceCents),
      lead.createdAt ? format(new Date(lead.createdAt), "yyyy-MM-dd HH:mm") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `uzklausos_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast({ title: "CSV eksportuotas" });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Užklausos</h1>
          <p className="text-muted-foreground">
            Gautos užklausos iš svetainės ({leadsData?.total || 0} viso)
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" data-testid="button-export-csv">
          <Download className="mr-2 h-4 w-4" />
          Eksportuoti CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Užklausų sąrašas</CardTitle>
            <Input
              placeholder="Ieškoti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
              data-testid="input-search-leads"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchQuery ? "Nerasta užklausų pagal paieškos kriterijus" : "Dar nėra gautų užklausų"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vardas</TableHead>
                    <TableHead>El. paštas</TableHead>
                    <TableHead>Planas</TableHead>
                    <TableHead className="text-right">Kaina</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{lead.planName}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(lead.totalPriceCents)} €
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.createdAt &&
                          format(new Date(lead.createdAt), "yyyy-MM-dd HH:mm", {
                            locale: lt,
                          })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLead(lead)}
                          data-testid={`button-view-lead-${lead.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Užklausos detalės</SheetTitle>
            <SheetDescription>
              {selectedLead?.createdAt &&
                format(new Date(selectedLead.createdAt), "yyyy MMMM d, HH:mm", {
                  locale: lt,
                })}
            </SheetDescription>
          </SheetHeader>

          {selectedLead && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Kontaktinė informacija</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedLead.name}</div>
                      <div className="text-muted-foreground">
                        {selectedLead.email}
                      </div>
                    </div>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Phone className="h-4 w-4" />
                      </div>
                      <span>{selectedLead.phone}</span>
                    </div>
                  )}
                  {selectedLead.city && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span>{selectedLead.city}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Pasirinktas planas</h3>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="mb-2 text-lg font-semibold">
                    {selectedLead.planName}
                  </div>
                  {selectedLead.selectedOptions &&
                    (selectedLead.selectedOptions as SelectedOptionData[]).length > 0 && (
                      <div className="space-y-2 border-t pt-3">
                        {(selectedLead.selectedOptions as SelectedOptionData[]).map(
                          (opt, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>
                                {opt.label} × {opt.quantity}
                              </span>
                              <span className="text-muted-foreground">
                                {formatPrice(opt.totalPrice)} €
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <span className="font-medium">Bendra kaina:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(selectedLead.totalPriceCents)} €
                    </span>
                  </div>
                </div>
              </div>

              {selectedLead.comment && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Komentaras</h3>
                  <div className="flex gap-3 rounded-lg border bg-muted/50 p-4">
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm">{selectedLead.comment}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selectedLead.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Rašyti laišką
                  </a>
                </Button>
                {selectedLead.phone && (
                  <Button asChild variant="outline" className="flex-1">
                    <a href={`tel:${selectedLead.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Skambinti
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
