import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Clipboard,
  ClipboardCheck,
  Globe,
  Hash,
  Loader2,
  Play,
  Rocket,
  Sparkles,
  Tag,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { CampaignResult } from "../data/affiliateData";
import { runAutonomousCampaign } from "../data/affiliateData";
import { useActor } from "../hooks/useActor";
import NetworkBadge from "./NetworkBadge";

// ── Agent pipeline steps ──────────────────────────────────────────────────────

const AGENT_STEPS = [
  {
    id: "affiliate",
    label: "Affiliate Agent",
    desc: "Scanning niches · ranking offers by demand score",
    icon: TrendingUp,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10 border-chart-2/20",
  },
  {
    id: "funnel",
    label: "Funnel Agent",
    desc: "Building 3-step conversion pipeline",
    icon: BarChart3,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10 border-chart-3/20",
  },
  {
    id: "copy",
    label: "Copy Agent",
    desc: "Writing headline · bullets · CTA",
    icon: Bot,
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
  },
  {
    id: "traffic",
    label: "Traffic Agent",
    desc: "Generating keywords · hooks · channels",
    icon: Globe,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10 border-chart-4/20",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onNewCampaign: (result: CampaignResult) => void;
  onGoToResults: () => void;
  latestCampaign?: CampaignResult;
}

type RunState = "idle" | "running" | "done";

export default function CommandCenterTab({
  onNewCampaign,
  onGoToResults,
  latestCampaign,
}: Props) {
  const { actor } = useActor();
  const [runState, setRunState] = useState<RunState>("idle");
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [currentResult, setCurrentResult] = useState<CampaignResult | null>(
    latestCampaign ?? null,
  );
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    if (runState === "running") return;

    setRunState("running");
    setActiveStepIdx(0);
    setCompletedSteps(new Set());
    setCurrentResult(null);

    // Fire backend call in background (don't await it to block UI)
    if (actor) {
      actor.runAllAgents().catch(() => {
        // silently ignore backend errors — UI runs from frontend intelligence
      });
    }

    // Animate through each step
    for (let i = 0; i < AGENT_STEPS.length; i++) {
      setActiveStepIdx(i);
      await delay(820);
      setCompletedSteps((prev) => new Set([...prev, i]));
    }

    // Generate the autonomous campaign result
    const result = runAutonomousCampaign();
    setCurrentResult(result);
    onNewCampaign(result);
    setRunState("done");
    setActiveStepIdx(-1);
    toast.success("Campaign generated — all agents complete");
  };

  const handleCopy = () => {
    if (!currentResult) return;
    const text = buildClipboardText(currentResult);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast.success("Campaign copied to clipboard");
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  const handleRunNew = async () => {
    setRunState("idle");
    setActiveStepIdx(-1);
    setCompletedSteps(new Set());
    setCurrentResult(null);
    // Immediately re-run
    setTimeout(handleRun, 100);
  };

  return (
    <div className="space-y-6">
      {/* ── Launch Panel ──────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-primary/25 bg-card/80 p-6 shadow-xl backdrop-blur-sm"
        style={{ boxShadow: "0 0 60px oklch(0.72 0.19 218 / 0.08)" }}
      >
        {/* Animated scan-line overlay */}
        <div className="pointer-events-none absolute inset-0 scan-line opacity-40" />

        <div className="relative space-y-5">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-black tracking-tight">
                  Autonomous Campaign Engine
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                AI picks the niche, selects the offer, builds the funnel, writes
                copy & traffic plan — fully automated
              </p>
            </div>
            {runState === "done" && (
              <Button
                data-ocid="command.run_new.button"
                variant="outline"
                size="sm"
                onClick={handleRunNew}
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10 shrink-0"
              >
                <Play className="h-3.5 w-3.5" />
                Run New Campaign
              </Button>
            )}
          </div>

          {/* Big CTA Button */}
          {runState !== "done" && (
            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Button
                data-ocid="command.run.primary_button"
                size="lg"
                onClick={handleRun}
                disabled={runState === "running"}
                className="relative w-full gap-3 overflow-hidden text-base font-bold tracking-wide py-6 rounded-xl"
                style={{
                  background:
                    runState === "running"
                      ? "oklch(0.72 0.19 218 / 0.4)"
                      : "linear-gradient(135deg, oklch(0.72 0.19 218), oklch(0.65 0.22 250))",
                  boxShadow:
                    runState === "idle"
                      ? "0 0 32px oklch(0.72 0.19 218 / 0.4), 0 4px 24px oklch(0.72 0.19 218 / 0.3)"
                      : "none",
                  color: "oklch(0.09 0.012 265)",
                }}
              >
                {runState === "running" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Agents Running…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Run Autonomous Campaign
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Agent Pipeline */}
          <AnimatePresence>
            {runState !== "idle" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {AGENT_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = completedSteps.has(idx);
                  const isActive = activeStepIdx === idx;
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-300 ${
                        isDone
                          ? "border-chart-2/30 bg-chart-2/8"
                          : isActive
                            ? `${step.bgColor} animate-border-glow`
                            : "border-border/30 bg-card/40 opacity-40"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                          isDone
                            ? "border-chart-2/30 bg-chart-2/15"
                            : isActive
                              ? `${step.bgColor} animate-thinking-pulse`
                              : "border-border/20 bg-muted/20"
                        }`}
                      >
                        {isDone ? (
                          <Check className="h-4 w-4 text-chart-2" />
                        ) : isActive ? (
                          <Loader2
                            className={`h-4 w-4 animate-spin ${step.color}`}
                          />
                        ) : (
                          <Icon className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-semibold ${isDone ? "text-chart-2" : isActive ? step.color : "text-muted-foreground/40"}`}
                        >
                          {step.label}
                        </p>
                        {isActive && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                            {step.desc}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Campaign Result Card ───────────────────────────────────── */}
      <AnimatePresence>
        {currentResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="animate-pipeline-complete space-y-4"
            data-ocid="command.result.card"
          >
            {/* Top: Niche + Offer ─────────────────────────────────── */}
            <div
              className="rounded-2xl border border-chart-2/20 bg-card/80 p-5 backdrop-blur-sm"
              style={{ boxShadow: "0 0 32px oklch(0.75 0.22 160 / 0.06)" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-chart-2" />
                <span className="text-sm font-semibold text-chart-2">
                  Campaign Selected
                </span>
                <Badge
                  variant="outline"
                  className="ml-auto border-chart-2/30 text-chart-2 font-mono text-[10px]"
                >
                  {new Date(currentResult.timestamp).toLocaleTimeString()}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Niche */}
                <div className="space-y-1.5">
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Selected Niche
                  </p>
                  <div className="rounded-xl border border-chart-2/20 bg-chart-2/8 p-4">
                    <p className="text-xl font-black text-chart-2">
                      {currentResult.niche.name}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-chart-2"
                          style={{
                            width: `${currentResult.niche.demandScore}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-chart-2 font-mono">
                        {currentResult.niche.demandScore}/100
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Avg payout: {currentResult.niche.avgPayout}
                    </p>
                  </div>
                </div>

                {/* Offer */}
                <div className="space-y-1.5">
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Top Offer
                  </p>
                  <div className="rounded-xl border border-primary/20 bg-primary/8 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xl font-black text-foreground">
                        {currentResult.offer.name}
                      </p>
                      <NetworkBadge network={currentResult.offer.network} />
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {currentResult.offer.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Badge className="bg-chart-2/15 text-chart-2 border-chart-2/20 gap-1 font-mono">
                        <Tag className="h-3 w-3" />
                        {currentResult.offer.payout} / sale
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        Score: {currentResult.offer.score}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Funnel Plan ─────────────────────────────────────────── */}
            <Card className="border-border bg-card/80">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-chart-3" />
                  <h3 className="font-semibold text-sm">Funnel Plan</h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] border-chart-3/30 text-chart-3"
                  >
                    3 Steps
                  </Badge>
                </div>
                <div className="space-y-2">
                  {currentResult.funnel.steps.map((step, stepNum) => {
                    const parts = step.split(":");
                    const label = parts[0]?.trim();
                    const content = parts.slice(1).join(":").trim();
                    const funnelOcid =
                      `command.funnel.item.${stepNum + 1}` as const;
                    const delay = 0.1 + stepNum * 0.1;
                    return (
                      <motion.div
                        key={step.slice(0, 20)}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay }}
                        data-ocid={funnelOcid}
                        className="flex gap-3 rounded-lg border border-border bg-muted/10 p-3.5"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chart-3/15 border border-chart-3/25 text-[11px] font-bold text-chart-3">
                          {stepNum + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-chart-3 uppercase tracking-wider mb-0.5">
                            {label}
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {content}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Sales Copy ──────────────────────────────────────────── */}
            <Card className="border-border bg-card/80">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Sales Copy</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                      Headline
                    </p>
                    <p className="text-lg font-bold leading-snug text-foreground">
                      {currentResult.copy.headline}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                      Subheadline
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      {currentResult.copy.subheadline}
                    </p>
                  </div>

                  <Separator className="bg-border/40" />

                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                      Bullet Points
                    </p>
                    <ul className="space-y-2">
                      {currentResult.copy.bullets.map((bullet, bulletIdx) => {
                        const bulletDelay = 0.2 + bulletIdx * 0.08;
                        return (
                          <motion.li
                            key={bullet.slice(0, 20)}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: bulletDelay }}
                            className="flex items-start gap-2.5 text-sm text-foreground"
                          >
                            <Check className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" />
                            {bullet}
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>

                  <Separator className="bg-border/40" />

                  <div
                    className="rounded-xl border border-chart-2/25 bg-chart-2/8 px-5 py-3.5 text-center font-bold text-chart-2 text-sm"
                    data-ocid="command.copy.cta"
                  >
                    → {currentResult.copy.cta}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Plan ────────────────────────────────────────── */}
            <Card className="border-border bg-card/80">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-chart-4" />
                  <h3 className="font-semibold text-sm">Traffic Plan</h3>
                </div>

                {/* Keywords */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      SEO Keywords
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentResult.traffic.keywords.map((kw, kwIdx) => {
                      const kwOcid =
                        `command.keywords.item.${kwIdx + 1}` as const;
                      const kwDelay = 0.05 * kwIdx;
                      return (
                        <motion.span
                          key={kw}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: kwDelay }}
                          data-ocid={kwOcid}
                          className="rounded-full border border-chart-4/25 bg-chart-4/10 px-3 py-1 text-[11px] font-mono text-chart-4"
                        >
                          {kw}
                        </motion.span>
                      );
                    })}
                  </div>
                </div>

                {/* Video Hooks */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Video className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      Video Hooks
                    </p>
                  </div>
                  <div className="space-y-2">
                    {currentResult.traffic.videoHooks.map((hook, hookIdx) => {
                      const hookOcid =
                        `command.hooks.item.${hookIdx + 1}` as const;
                      return (
                        <div
                          key={hook.slice(0, 20)}
                          data-ocid={hookOcid}
                          className="flex items-start gap-2 rounded-lg border border-border/40 bg-muted/10 px-3.5 py-2.5"
                        >
                          <span className="mt-0.5 text-chart-4 text-xs font-bold shrink-0">
                            #{hookIdx + 1}
                          </span>
                          <p className="text-sm text-foreground">{hook}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Channels */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      Organic Channels
                    </p>
                  </div>
                  <div className="space-y-2">
                    {currentResult.traffic.channels.map((ch, chIdx) => {
                      const parts = ch.split(" — ");
                      const chOcid =
                        `command.channels.item.${chIdx + 1}` as const;
                      return (
                        <div
                          key={ch.slice(0, 20)}
                          data-ocid={chOcid}
                          className="flex items-start gap-2 rounded-lg border border-chart-3/20 bg-chart-3/6 px-3.5 py-2.5"
                        >
                          <span className="font-bold text-chart-3 text-xs mt-0.5 shrink-0">
                            {parts[0]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            — {parts.slice(1).join(" — ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                data-ocid="command.copy_campaign.button"
                variant="outline"
                onClick={handleCopy}
                className="gap-2 border-border hover:border-primary/40"
              >
                {copied ? (
                  <>
                    <ClipboardCheck className="h-4 w-4 text-chart-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4" />
                    Copy Full Campaign
                  </>
                )}
              </Button>
              <Button
                data-ocid="command.view_results.button"
                variant="ghost"
                onClick={onGoToResults}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                View All Campaigns
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle state hint */}
      {runState === "idle" && !currentResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          data-ocid="command.idle.empty_state"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-14 text-center"
        >
          <Sparkles className="h-10 w-10 text-primary/30 mb-3 animate-pulse" />
          <p className="text-base font-semibold text-muted-foreground">
            Ready to launch
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs">
            Click "Run Autonomous Campaign" — the AI handles everything from
            niche selection to traffic strategy
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildClipboardText(r: CampaignResult): string {
  return [
    "VANTAGE ONE — CAMPAIGN REPORT",
    `Generated: ${new Date(r.timestamp).toLocaleString()}`,
    "",
    "=== SELECTED NICHE ===",
    `${r.niche.name} (Demand Score: ${r.niche.demandScore}/100)`,
    "",
    "=== TOP OFFER ===",
    `${r.offer.name} on ${r.offer.network}`,
    `Payout: ${r.offer.payout} per sale`,
    r.offer.description,
    "",
    "=== FUNNEL PLAN ===",
    ...r.funnel.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "=== SALES COPY ===",
    `HEADLINE: ${r.copy.headline}`,
    `SUBHEADLINE: ${r.copy.subheadline}`,
    "BULLETS:",
    ...r.copy.bullets.map((b) => `• ${b}`),
    `CTA: ${r.copy.cta}`,
    "",
    "=== TRAFFIC PLAN ===",
    "SEO Keywords:",
    ...r.traffic.keywords.map((k) => `• ${k}`),
    "Video Hooks:",
    ...r.traffic.videoHooks.map((h) => `• ${h}`),
    "Organic Channels:",
    ...r.traffic.channels.map((c) => `• ${c}`),
  ].join("\n");
}
