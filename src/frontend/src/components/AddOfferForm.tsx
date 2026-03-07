import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart2,
  DollarSign,
  Loader2,
  MousePointerClick,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import type { Offer } from "../backend";
import {
  useAddOffer,
  useAddOfferMetrics,
  useGetAllOffers,
  useGetOfferPerformanceSummary,
} from "../hooks/useQueries";

function MetricsForm({
  offer,
  onClose,
}: { offer: Offer; onClose: () => void }) {
  const [clicks, setClicks] = useState("");
  const [conversionPct, setConversionPct] = useState("");
  const [revenue, setRevenue] = useState("");
  const addMetrics = useAddOfferMetrics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMetrics.mutate(
      {
        offerId: offer.id,
        clickCount: BigInt(Math.round(Number(clicks) || 0)),
        conversionRate: (Number(conversionPct) || 0) / 100,
        revenueTotal: BigInt(Math.round((Number(revenue) || 0) * 100)),
      },
      {
        onSuccess: onClose,
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md bg-muted/30 p-3 text-sm">
        <span className="text-muted-foreground">Recording metrics for: </span>
        <span className="font-mono font-medium">{offer.productId}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="clicks" className="text-xs">
            Clicks
          </Label>
          <Input
            id="clicks"
            data-ocid="metrics.clicks.input"
            type="number"
            min="0"
            value={clicks}
            onChange={(e) => setClicks(e.target.value)}
            placeholder="0"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="conversion" className="text-xs">
            Conversion %
          </Label>
          <Input
            id="conversion"
            data-ocid="metrics.conversion.input"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={conversionPct}
            onChange={(e) => setConversionPct(e.target.value)}
            placeholder="0.0"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="revenue" className="text-xs">
            Revenue $
          </Label>
          <Input
            id="revenue"
            data-ocid="metrics.revenue.input"
            type="number"
            min="0"
            step="0.01"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="0.00"
            className="h-9 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          data-ocid="metrics.cancel_button"
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          data-ocid="metrics.submit_button"
          type="submit"
          size="sm"
          disabled={addMetrics.isPending}
          className="flex-1"
        >
          {addMetrics.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save Metrics"
          )}
        </Button>
      </div>
    </form>
  );
}

export default function AddOfferForm() {
  const { data: offers = [] } = useGetAllOffers();
  const { data: performanceSummary } = useGetOfferPerformanceSummary();
  const addOffer = useAddOffer();

  const [productId, setProductId] = useState("");
  const [price, setPrice] = useState("");
  const [commission, setCommission] = useState("");
  const [metricsOfferId, setMetricsOfferId] = useState<string | null>(null);
  const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId.trim() || !price) return;
    const now = BigInt(Date.now()) * 1_000_000n;
    addOffer.mutate(
      {
        productId: productId.trim(),
        priceInCents: BigInt(Math.round(Number(price) * 100)),
        commissionRate: (Number(commission) || 0) / 100,
        startDate: now,
        endDate: null,
      },
      {
        onSuccess: () => {
          setProductId("");
          setPrice("");
          setCommission("");
        },
      },
    );
  };

  const selectedOffer = offers.find((o) => o.id === metricsOfferId);

  return (
    <div className="space-y-6">
      {/* Add New Offer */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-primary" />
            Add New Offer
          </CardTitle>
          <CardDescription>
            Register a new affiliate offer to track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="productId">Product Name / ID</Label>
                <Input
                  id="productId"
                  data-ocid="offer.product_id.input"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="JavaBurn, BioFit..."
                  required
                  className="bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Price ($)
                </Label>
                <Input
                  id="price"
                  data-ocid="offer.price.input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="47.00"
                  required
                  className="bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="commission">Commission %</Label>
                <Input
                  id="commission"
                  data-ocid="offer.commission.input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="50"
                  className="bg-card"
                />
              </div>
            </div>
            <Button
              data-ocid="offer.submit_button"
              type="submit"
              disabled={addOffer.isPending || !productId.trim() || !price}
              className="gap-2"
            >
              {addOffer.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add Offer
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-chart-2" />
            Active Offers
            <Badge variant="outline" className="ml-auto font-normal">
              {offers.length} offers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div
              data-ocid="offers.empty_state"
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <TrendingUp className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No offers yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add your first affiliate offer above
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table data-ocid="offers.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead className="text-right">
                      <span className="flex items-center justify-end gap-1">
                        <MousePointerClick className="h-3 w-3" /> Clicks
                      </span>
                    </TableHead>
                    <TableHead className="text-right">
                      <span className="flex items-center justify-end gap-1">
                        <Target className="h-3 w-3" /> Conv %
                      </span>
                    </TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer, idx) => {
                    const clicks =
                      performanceSummary?.clickCounts.find(
                        ([id]) => id === offer.id,
                      )?.[1] ?? 0n;
                    const convRate =
                      performanceSummary?.conversionRates.find(
                        ([id]) => id === offer.id,
                      )?.[1] ?? 0;
                    const rev =
                      performanceSummary?.allMetrics.find(
                        (m) => m.clickCount === clicks,
                      )?.revenueTotal ?? 0n;
                    const now = Date.now() * 1_000_000;
                    const isActive =
                      !offer.endDate || Number(offer.endDate) > now;

                    return (
                      <TableRow
                        key={offer.id}
                        data-ocid={`offers.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {offer.productId}
                            <Badge
                              variant={isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {isActive ? "Active" : "Ended"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          ${(Number(offer.priceInCents) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {(offer.commissionRate * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(clicks).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(convRate * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-chart-2">
                          ${(Number(rev) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Dialog
                            open={
                              metricsDialogOpen && metricsOfferId === offer.id
                            }
                            onOpenChange={(open) => {
                              setMetricsDialogOpen(open);
                              if (!open) setMetricsOfferId(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                data-ocid={`offers.edit_button.${idx + 1}`}
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setMetricsOfferId(offer.id);
                                  setMetricsDialogOpen(true);
                                }}
                                className="gap-1.5 text-xs"
                              >
                                <BarChart2 className="h-3.5 w-3.5" />
                                Record
                              </Button>
                            </DialogTrigger>
                            <DialogContent data-ocid="offers.dialog">
                              <DialogHeader>
                                <DialogTitle>Record Metrics</DialogTitle>
                              </DialogHeader>
                              {selectedOffer && (
                                <MetricsForm
                                  offer={selectedOffer}
                                  onClose={() => {
                                    setMetricsDialogOpen(false);
                                    setMetricsOfferId(null);
                                  }}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
