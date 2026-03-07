import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  Rocket,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AgentType } from "../backend";
import type { KnowledgeEntry } from "../backend";
import {
  useGetCallerKnowledgeEntries,
  useGetTotalActiveOffers,
  useRunAllAgents,
} from "../hooks/useQueries";

type PipelineStep = {
  id: string;
  label: string;
  icon: typeof TrendingUp;
  color: string;
  agentType: AgentType;
  status: "pending" | "running" | "done";
};

const PIPELINE_STEPS: Omit<PipelineStep, "status">[] = [
  {
    id: "affiliate",
    label: "Affiliate Agent",
    icon: TrendingUp,
    color: "text-chart-2",
    agentType: AgentType.affiliate,
  },
  {
    id: "funnel",
    label: "Funnel Agent",
    icon: Zap,
    color: "text-chart-3",
    agentType: AgentType.habit,
  },
  {
    id: "copy",
    label: "Copy Agent",
    icon: FileText,
    color: "text-chart-1",
    agentType: AgentType.copy,
  },
  {
    id: "traffic",
    label: "Traffic Agent",
    icon: ChevronRight,
    color: "text-primary",
    agentType: AgentType.affiliate,
  },
  {
    id: "analytics",
    label: "Analytics Agent",
    icon: BarChart2,
    color: "text-chart-4",
    agentType: AgentType.analytics,
  },
];

const NICHES = [
  "weight loss",
  "passive income",
  "crypto",
  "fitness",
  "debt relief",
];

const agentTypeConfig: Record<AgentType, { label: string; color: string }> = {
  [AgentType.habit]: { label: "Funnel", color: "text-chart-3" },
  [AgentType.affiliate]: { label: "Affiliate", color: "text-chart-2" },
  [AgentType.copy]: { label: "Copy", color: "text-primary" },
  [AgentType.analytics]: { label: "Analytics", color: "text-chart-4" },
};

interface CampaignLauncherProps {
  onLaunched?: () => void;
  onGoToAdmin?: () => void;
}

export default function CampaignLauncher({
  onLaunched,
  onGoToAdmin,
}: CampaignLauncherProps) {
  const [niche, setNiche] = useState("");
  const [pipeline, setPipeline] = useState<PipelineStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [campaignResults, setCampaignResults] = useState<KnowledgeEntry[]>([]);

  const runAllAgents = useRunAllAgents();
  const { data: totalActiveOffers } = useGetTotalActiveOffers();
  const { data: knowledgeEntries = [] } = useGetCallerKnowledgeEntries();
  const queryClient = useQueryClient();

  const offerCount =
    totalActiveOffers !== undefined ? Number(totalActiveOffers) : null;
  const hasNoOffers = offerCount === 0;

  const handleLaunch = async () => {
    if (!niche.trim()) return;
    const steps: PipelineStep[] = PIPELINE_STEPS.map((s) => ({
      ...s,
      status: "pending",
    }));
    setPipeline(steps);
    setIsRunning(true);
    setIsComplete(false);
    setCampaignResults([]);

    // Animate pipeline steps
    steps.forEach((_, idx) => {
      setTimeout(() => {
        setPipeline((prev) =>
          prev.map((s, i) => (i === idx ? { ...s, status: "running" } : s)),
        );
      }, idx * 1400);
      setTimeout(
        () => {
          setPipeline((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, status: "done" } : s)),
          );
        },
        idx * 1400 + 1000,
      );
    });

    // Fire backend and wait for completion
    const animDuration = steps.length * 1400 + 600;
    runAllAgents.mutate(undefined, {
      onSuccess: () => {
        // After backend completes, refetch knowledge entries and show results
        setTimeout(
          () => {
            queryClient
              .invalidateQueries({ queryKey: ["knowledgeEntries"] })
              .then(() => {
                const fresh =
                  queryClient.getQueryData<KnowledgeEntry[]>([
                    "knowledgeEntries",
                  ]) ?? knowledgeEntries;
                // Show up to 4 most recent entries
                const sorted = [...fresh].sort(
                  (a, b) => Number(b.timestamp) - Number(a.timestamp),
                );
                setCampaignResults(sorted.slice(0, 4));
                setIsRunning(false);
                setIsComplete(true);
                onLaunched?.();
              });
          },
          Math.max(0, animDuration - 1000),
        );
      },
      onError: () => {
        setTimeout(() => {
          setIsRunning(false);
          setIsComplete(false);
          setPipeline([]);
        }, animDuration);
      },
    });

    // Finish animation regardless
    setTimeout(() => {
      if (!isComplete) {
        setIsRunning(false);
        setIsComplete(true);
        // Surface latest knowledge entries from cache
        const cached =
          queryClient.getQueryData<KnowledgeEntry[]>(["knowledgeEntries"]) ??
          [];
        const sorted = [...cached].sort(
          (a, b) => Number(b.timestamp) - Number(a.timestamp),
        );
        setCampaignResults(sorted.slice(0, 4));
        onLaunched?.();
      }
    }, animDuration);
  };

  const handleReset = () => {
    setPipeline([]);
    setIsComplete(false);
    setNiche("");
    setCampaignResults([]);
  };

  return (
    <div className="space-y-5">
      {/* No-offers nudge */}
      {hasNoOffers && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3"
          data-ocid="campaign.no_offers.panel"
        >
          <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-300">
              Your first step: Add affiliate offers
            </p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              Go to Admin → Offers section and add an offer. The agents need
              offers to pick from — without them, campaigns can't select a
              product.
            </p>
          </div>
          {onGoToAdmin && (
            <Button
              data-ocid="campaign.go_to_admin.button"
              size="sm"
              variant="outline"
              onClick={onGoToAdmin}
              className="shrink-0 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/60 text-xs"
            >
              Go to Admin → Offers
            </Button>
          )}
        </motion.div>
      )}

      {/* Launcher Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Input
            data-ocid="campaign.input"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !isRunning && niche.trim() && handleLaunch()
            }
            placeholder="Enter niche: weight loss, passive income, crypto..."
            className="h-12 border-border bg-card font-mono text-base pr-4 focus-visible:ring-primary/50 focus-visible:border-primary/50"
            disabled={isRunning}
          />
        </div>
        <Button
          data-ocid="campaign.primary_button"
          onClick={handleLaunch}
          disabled={isRunning || !niche.trim()}
          className="h-12 min-w-[160px] gap-2 bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Launching...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Launch Campaign
            </>
          )}
        </Button>
      </div>

      {/* Quick Niche Suggestions */}
      {!isRunning && pipeline.length === 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">
            Quick launch:
          </span>
          {NICHES.map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setNiche(n)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:text-primary transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Pipeline Visualization */}
      <AnimatePresence>
        {pipeline.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Campaign Pipeline — {niche}
                </span>
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5"
                  >
                    <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Campaign Live
                    </Badge>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Reset
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                {pipeline.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-start gap-3 rounded-md p-2.5 transition-all duration-300 ${
                        step.status === "running"
                          ? "bg-primary/8 border border-primary/20"
                          : step.status === "done"
                            ? "bg-chart-2/5 border border-chart-2/10"
                            : "bg-muted/20 border border-transparent"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          step.status === "done"
                            ? "bg-chart-2/20"
                            : step.status === "running"
                              ? "bg-primary/20"
                              : "bg-muted/40"
                        }`}
                      >
                        {step.status === "done" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" />
                        ) : step.status === "running" ? (
                          <Loader2
                            className={`h-3.5 w-3.5 animate-spin ${step.color}`}
                          />
                        ) : (
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              step.status === "done"
                                ? "text-foreground"
                                : step.status === "running"
                                  ? "text-primary"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </span>
                          {step.status === "running" && (
                            <span className="text-xs text-primary animate-pulse">
                              processing...
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Results — real data from knowledge entries */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-4 space-y-3"
            data-ocid="campaign.results.panel"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-chart-2" />
              <span className="text-sm font-semibold text-chart-2">
                Campaign Results
              </span>
              <Badge
                variant="outline"
                className="ml-auto text-xs text-chart-2 border-chart-2/30"
              >
                {campaignResults.length} outputs
              </Badge>
            </div>

            {campaignResults.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono py-2">
                No knowledge entries yet. Run agents a few times to build up
                results — they write to the knowledge core on each execution.
              </p>
            ) : (
              <ScrollArea className="max-h-60">
                <div className="space-y-2 pr-2">
                  {campaignResults.map((entry, i) => {
                    const cfg = agentTypeConfig[entry.sourceAgent] ?? {
                      label: "Agent",
                      color: "text-muted-foreground",
                    };
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        data-ocid={`campaign.result.item.${i + 1}`}
                        className="flex gap-2.5 rounded-md border border-border bg-card/60 p-2.5"
                      >
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 shrink-0 self-start mt-0.5 capitalize ${cfg.color}`}
                        >
                          {cfg.label}
                        </Badge>
                        <p className="text-xs font-mono text-foreground leading-relaxed">
                          {entry.content}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
