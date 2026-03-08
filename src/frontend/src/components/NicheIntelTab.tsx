import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BookOpen, DollarSign, Star, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { NICHES, OFFERS } from "../data/affiliateData";
import NetworkBadge from "./NetworkBadge";

export default function NicheIntelTab() {
  const [selectedNicheId, setSelectedNicheId] = useState<string | null>(null);

  const filteredOffers = selectedNicheId
    ? OFFERS.filter((o) => o.nicheId === selectedNicheId)
    : OFFERS;

  const selectedNiche = NICHES.find((n) => n.id === selectedNicheId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold font-display">
            Niche &amp; Offer Intelligence
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          All niches and offers the AI uses to pick the best campaign. Demand
          scores and payouts are built-in intelligence data.
        </p>
      </div>

      {/* ── Niches Grid ──────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
            Available Niches
          </h3>
          {selectedNicheId && (
            <button
              type="button"
              onClick={() => setSelectedNicheId(null)}
              className="text-xs text-primary hover:underline"
              data-ocid="intel.clear_filter.button"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {NICHES.map((niche, idx) => {
            const isSelected = selectedNicheId === niche.id;
            const isBest =
              niche.demandScore ===
              Math.max(...NICHES.map((n) => n.demandScore));
            const scoreColor =
              niche.demandScore >= 90
                ? "text-chart-2"
                : niche.demandScore >= 80
                  ? "text-chart-4"
                  : "text-muted-foreground";
            const barColor =
              niche.demandScore >= 90
                ? "bg-chart-2"
                : niche.demandScore >= 80
                  ? "bg-chart-4"
                  : "bg-muted-foreground/50";

            return (
              <motion.button
                key={niche.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setSelectedNicheId(isSelected ? null : niche.id)}
                data-ocid={`intel.niche.item.${idx + 1}`}
                className={`relative rounded-xl border p-4 text-left transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 ${
                  isSelected
                    ? "border-primary/40 bg-primary/8"
                    : "border-border bg-card/60"
                }`}
              >
                {isBest && (
                  <span className="absolute -top-2 -right-1 flex items-center gap-0.5 rounded-full border border-chart-2/30 bg-chart-2/15 px-2 py-0.5 text-[10px] font-bold text-chart-2">
                    <Star className="h-2.5 w-2.5 fill-chart-2" />
                    AI PICKS THIS
                  </span>
                )}
                <p className="font-bold text-sm mb-2 pr-2">{niche.name}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Demand
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${scoreColor}`}
                    >
                      {niche.demandScore}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${niche.demandScore}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <DollarSign className="h-3 w-3 text-muted-foreground/60" />
                    <span className="text-[11px] text-muted-foreground">
                      {niche.avgPayout} avg payout
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <Separator className="bg-border/30" />

      {/* ── Offers Grid ──────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
              Available Offers
            </h3>
            {selectedNiche && (
              <Badge
                variant="outline"
                className="border-primary/30 text-primary text-[10px]"
              >
                {selectedNiche.name}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {filteredOffers.length} offers
          </Badge>
        </div>

        {selectedNicheId ? (
          <OffersGroup
            nicheId={selectedNicheId}
            niche={selectedNiche?.name ?? ""}
            offers={filteredOffers}
            startIdx={0}
          />
        ) : (
          <div className="space-y-5">
            {NICHES.map((niche) => {
              const nicheOffers = OFFERS.filter((o) => o.nicheId === niche.id);
              const startIdx = OFFERS.indexOf(nicheOffers[0]);
              return (
                <OffersGroup
                  key={niche.id}
                  nicheId={niche.id}
                  niche={niche.name}
                  offers={nicheOffers}
                  startIdx={startIdx}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Offers group by niche ──────────────────────────────────────────────────────

interface OffersGroupProps {
  nicheId: string;
  niche: string;
  offers: ReturnType<typeof OFFERS.filter>;
  startIdx: number;
}

function OffersGroup({ niche, offers, startIdx }: OffersGroupProps) {
  if (offers.length === 0) return null;

  const topOffer = offers.reduce((best, o) =>
    o.score > best.score ? o : best,
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/60" />
        <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {niche}
        </h4>
        <div className="h-px flex-1 bg-border/30" />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {offers.map((offer, i) => {
          const isTop = offer.id === topOffer.id;
          const absoluteIdx = startIdx + i + 1;
          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`intel.offer.item.${absoluteIdx}`}
              className={`relative rounded-xl border p-3.5 transition-colors ${
                isTop
                  ? "border-chart-2/25 bg-chart-2/6"
                  : "border-border/50 bg-card/40"
              }`}
            >
              {isTop && (
                <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full border border-chart-2/25 bg-chart-2/15 px-1.5 py-0.5 text-[9px] font-bold text-chart-2">
                  TOP
                </span>
              )}
              <div className="flex items-start gap-2 mb-2 pr-6">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{offer.name}</p>
                </div>
                <NetworkBadge network={offer.network} className="shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                {offer.description}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground/60">
                    Score
                  </span>
                  <span className="text-xs font-bold text-foreground font-mono">
                    {offer.score}
                  </span>
                </div>
                <div className="h-3 w-px bg-border/40" />
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-chart-2" />
                  <span className="text-xs font-bold text-chart-2 font-mono">
                    {offer.payout}
                  </span>
                </div>
              </div>
              <div className="mt-2 h-1 rounded-full bg-muted/20 overflow-hidden">
                <div
                  className={`h-full rounded-full ${isTop ? "bg-chart-2" : "bg-primary/50"}`}
                  style={{ width: `${offer.score}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
