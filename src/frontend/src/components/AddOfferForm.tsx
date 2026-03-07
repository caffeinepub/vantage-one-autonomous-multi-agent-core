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
  CheckCircle2,
  DollarSign,
  Loader2,
  MousePointerClick,
  Plus,
  Rocket,
  Target,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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

interface AddOfferFormProps {
  onLaunchCampaign?: (niche: string) => void;
}

export default function AddOfferForm({ onLaunchCampaign }: AddOfferFormProps) {
  const { data: offers = [] } = useGetAllOffers();
  const { data: performanceSummary } = useGetOfferPerformanceSummary();
  const addOffer = useAddOffer();

  const [productName, setProductName] = useState("");
  const [payout, setPayout] = useState("");
  const [commissionPct, setCommissionPct] = useState("");
  const [network, setNetwork] = useState("");
  const [niche, setNiche] = useState("");
  const [metricsOfferId, setMetricsOfferId] = useState<string | null>(null);
  const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<{
    name: string;
    niche: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !payout) return;

    // Encode network + niche info into productId since backend stores it as string
    // Format: "ProductName [Network] {niche}"
    const encodedId = [
      productName.trim(),
      network.trim() ? `[${network.trim()}]` : "",
      niche.trim() ? `{${niche.trim()}}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const now = BigInt(Date.now()) * 1_000_000n;
    const capturedNiche = niche.trim();
    const capturedName = productName.trim();

    addOffer.mutate(
      {
        productId: encodedId,
        priceInCents: BigInt(Math.round(Number(payout) * 100)),
        commissionRate: (Number(commissionPct) || 0) / 100,
        startDate: now,
        endDate: null,
      },
      {
        onSuccess: () => {
          setProductName("");
          setPayout("");
          setCommissionPct("");
          setNetwork("");
          setNiche("");
          setJustAdded({ name: capturedName, niche: capturedNiche });
        },
      },
    );
  };

  const selectedOffer = offers.find((o) => o.id === metricsOfferId);

  // Parse display name from encoded productId
  const parseProductDisplay = (productId: string) => {
    const name = productId
      .replace(/\[.*?\]/g, "")
      .replace(/\{.*?\}/g, "")
      .trim();
    const networkMatch = productId.match(/\[(.*?)\]/);
    const nicheMatch = productId.match(/\{(.*?)\}/);
    return {
      name: name || productId,
      network: networkMatch?.[1] ?? "—",
      niche: nicheMatch?.[1] ?? "—",
    };
  };

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
            Register a new affiliate offer. Agents will discover and promote
            offers you add here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  data-ocid="offer.product_id.input"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. JavaBurn, BioFit, Keto Prime..."
                  required
                  className="bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="network">Network</Label>
                <Input
                  id="network"
                  data-ocid="offer.network.input"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  placeholder="ClickBank, JVZoo, Digistore24..."
                  className="bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="niche">Niche</Label>
                <Input
                  id="niche"
                  data-ocid="offer.niche.input"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="weight loss, crypto, fitness..."
                  className="bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payout" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Payout ($)
                </Label>
                <Input
                  id="payout"
                  data-ocid="offer.price.input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={payout}
                  onChange={(e) => setPayout(e.target.value)}
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
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(e.target.value)}
                  placeholder="50"
                  className="bg-card"
                />
              </div>
            </div>
            <Button
              data-ocid="offer.submit_button"
              type="submit"
              disabled={addOffer.isPending || !productName.trim() || !payout}
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

      {/* Success state after adding */}
      <AnimatePresence>
        {justAdded && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-lg border border-chart-2/30 bg-chart-2/10 px-4 py-3"
            data-ocid="offer.success_state"
          >
            <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-chart-2">
                "{justAdded.name}" added successfully
              </p>
              {justAdded.niche && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ready for agents to discover and promote in the{" "}
                  <span className="font-medium">{justAdded.niche}</span> niche
                </p>
              )}
            </div>
            {justAdded.niche && onLaunchCampaign && (
              <Button
                data-ocid="offer.launch_campaign.button"
                size="sm"
                variant="outline"
                onClick={() => {
                  onLaunchCampaign(justAdded.niche);
                  setJustAdded(null);
                }}
                className="shrink-0 gap-1.5 border-chart-2/40 text-chart-2 hover:bg-chart-2/10 text-xs"
              >
                <Rocket className="h-3 w-3" />
                Launch campaign for this niche
              </Button>
            )}
            <button
              type="button"
              onClick={() => setJustAdded(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                Add your first affiliate offer above to get started
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table data-ocid="offers.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Niche</TableHead>
                    <TableHead>Payout</TableHead>
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
                    const parsed = parseProductDisplay(offer.productId);
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
                            {parsed.name}
                            <Badge
                              variant={isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {isActive ? "Active" : "Ended"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {parsed.network}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {parsed.niche}
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
                                Record Metrics
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
