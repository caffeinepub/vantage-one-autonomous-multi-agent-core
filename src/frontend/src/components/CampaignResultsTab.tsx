import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Hash,
  Play,
  Rocket,
  Tag,
  TrendingUp,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { CampaignResult } from "../data/affiliateData";
import NetworkBadge from "./NetworkBadge";

interface Props {
  campaigns: CampaignResult[];
  onRunNew: () => void;
}

export default function CampaignResultsTab({ campaigns, onRunNew }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(
    campaigns[0]?.id ?? null,
  );

  if (campaigns.length === 0) {
    return (
      <div
        data-ocid="results.empty_state"
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-20 text-center"
      >
        <Rocket className="h-12 w-12 text-primary/20 mb-4 animate-float" />
        <p className="text-lg font-bold text-muted-foreground">
          No campaigns yet
        </p>
        <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs">
          Run your first autonomous campaign to see the results here
        </p>
        <Button
          data-ocid="results.run_new.primary_button"
          onClick={onRunNew}
          className="mt-5 gap-2"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.19 218), oklch(0.65 0.22 250))",
            color: "oklch(0.09 0.012 265)",
          }}
        >
          <Play className="h-4 w-4" />
          Run First Campaign
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display">Campaign History</h2>
          <p className="text-sm text-muted-foreground">
            {campaigns.length} autonomous campaign
            {campaigns.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <Button
          data-ocid="results.run_new.button"
          onClick={onRunNew}
          size="sm"
          className="gap-2"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.19 218), oklch(0.65 0.22 250))",
            color: "oklch(0.09 0.012 265)",
          }}
        >
          <Play className="h-3.5 w-3.5" />
          Run New
        </Button>
      </div>

      <div className="space-y-3">
        {campaigns.map((campaign, idx) => {
          const isExpanded = expandedId === campaign.id;
          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              data-ocid={`results.item.${idx + 1}`}
              className="rounded-xl border border-border bg-card/80 overflow-hidden"
            >
              {/* Summary Row */}
              <button
                type="button"
                className="w-full flex flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between hover:bg-muted/10 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : campaign.id)}
                data-ocid={`results.expand.toggle.${idx + 1}`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Rocket className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">
                        {campaign.niche.name}
                      </span>
                      <span className="text-muted-foreground text-xs">→</span>
                      <span className="font-bold text-sm">
                        {campaign.offer.name}
                      </span>
                      <NetworkBadge network={campaign.offer.network} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(campaign.timestamp).toLocaleString()}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-chart-2/30 text-chart-2 gap-1"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {campaign.offer.payout}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono border-chart-2/20 text-chart-2"
                  >
                    Score: {campaign.offer.score}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <Separator className="bg-border/30" />
                    <div className="p-4 space-y-4">
                      <CampaignDetail campaign={campaign} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Expanded campaign detail ──────────────────────────────────────────────────

function CampaignDetail({ campaign }: { campaign: CampaignResult }) {
  return (
    <div className="space-y-4">
      {/* Funnel */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart3 className="h-3.5 w-3.5 text-chart-3" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Funnel Steps
          </p>
        </div>
        <div className="space-y-1.5">
          {campaign.funnel.steps.map((step) => {
            const parts = step.split(":");
            const label = parts[0]?.trim();
            const content = parts.slice(1).join(":").trim();
            const stepNum =
              ["1", "2", "3"][campaign.funnel.steps.indexOf(step)] ?? "0";
            return (
              <div
                key={step.slice(0, 20)}
                className="flex gap-2.5 rounded-lg border border-border/40 bg-muted/10 px-3 py-2"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-chart-3/15 text-[10px] font-bold text-chart-3 mt-0.5">
                  {stepNum}
                </span>
                <div>
                  <span className="text-[10px] font-bold text-chart-3 uppercase tracking-wider">
                    {label}:{" "}
                  </span>
                  <span className="text-xs text-foreground">{content}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Copy */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Bot className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sales Copy
          </p>
        </div>
        <Card className="border-border/40 bg-muted/10">
          <CardContent className="p-3 space-y-2">
            <p className="text-sm font-bold">{campaign.copy.headline}</p>
            <p className="text-xs text-muted-foreground italic">
              {campaign.copy.subheadline}
            </p>
            <ul className="space-y-1">
              {campaign.copy.bullets.map((b) => (
                <li
                  key={b.slice(0, 20)}
                  className="flex items-start gap-1.5 text-xs text-foreground"
                >
                  <Check className="h-3.5 w-3.5 text-chart-2 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="rounded border border-chart-2/25 bg-chart-2/8 px-3 py-2 text-center text-xs font-bold text-chart-2">
              → {campaign.copy.cta}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Globe className="h-3.5 w-3.5 text-chart-4" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Traffic Plan
          </p>
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Hash className="h-3 w-3 text-muted-foreground/60" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                Keywords
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {campaign.traffic.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-chart-4/25 bg-chart-4/10 px-2 py-0.5 text-[10px] font-mono text-chart-4"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Video className="h-3 w-3 text-muted-foreground/60" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                Video Hooks
              </span>
            </div>
            <ul className="space-y-1">
              {campaign.traffic.videoHooks.map((h) => (
                <li
                  key={h.slice(0, 20)}
                  className="text-xs text-foreground flex gap-1.5"
                >
                  <TrendingUp className="h-3 w-3 text-chart-4 mt-0.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
