import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
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
import { useEffect, useState } from "react";
import { useRunAllAgents } from "../hooks/useQueries";

type PipelineStep = {
  id: string;
  label: string;
  icon: typeof TrendingUp;
  color: string;
  output: string;
  status: "pending" | "running" | "done";
};

const buildPipeline = (niche: string): PipelineStep[] => [
  {
    id: "affiliate",
    label: "Affiliate Agent",
    icon: TrendingUp,
    color: "text-chart-2",
    output: `Found 3 offers | Top: JavaBurn (gravity: 110, payout: $42) for niche: ${niche}`,
    status: "pending",
  },
  {
    id: "funnel",
    label: "Funnel Agent",
    icon: Zap,
    color: "text-chart-3",
    output: `Funnel mapped | 3 steps: Traffic → Bridge → Offer (${niche})`,
    status: "pending",
  },
  {
    id: "copy",
    label: "Copy Agent",
    icon: FileText,
    color: "text-chart-1",
    output: `Generated landing page | Headline: "The System Behind JavaBurn's Breakthrough Results"`,
    status: "pending",
  },
  {
    id: "traffic",
    label: "Traffic Agent",
    icon: ChevronRight,
    color: "text-primary",
    output: `SEO strategy ready | Keywords: "${niche} without ads", "best ${niche} system"`,
    status: "pending",
  },
  {
    id: "analytics",
    label: "Analytics Agent",
    icon: BarChart2,
    color: "text-chart-4",
    output: `Analyzed 5 data points | Best niche: ${niche} (82% score) — pipeline optimized`,
    status: "pending",
  },
];

const NICHES = [
  "weight loss",
  "passive income",
  "crypto",
  "fitness",
  "debt relief",
];

interface CampaignLauncherProps {
  onLaunched?: () => void;
}

export default function CampaignLauncher({
  onLaunched,
}: CampaignLauncherProps) {
  const [niche, setNiche] = useState("");
  const [pipeline, setPipeline] = useState<PipelineStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const runAllAgents = useRunAllAgents();

  const handleLaunch = () => {
    if (!niche.trim()) return;
    const nicheValue = niche.trim();
    const steps = buildPipeline(nicheValue);
    setPipeline(steps.map((s) => ({ ...s, status: "pending" })));
    setIsRunning(true);
    setIsComplete(false);

    // Fire backend
    runAllAgents.mutate();

    // Animate pipeline steps sequentially
    steps.forEach((_, idx) => {
      // Start step
      setTimeout(() => {
        setPipeline((prev) =>
          prev.map((s, i) => (i === idx ? { ...s, status: "running" } : s)),
        );
      }, idx * 1400);
      // Complete step
      setTimeout(
        () => {
          setPipeline((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, status: "done" } : s)),
          );
        },
        idx * 1400 + 1000,
      );
    });

    // All done
    setTimeout(
      () => {
        setIsRunning(false);
        setIsComplete(true);
        onLaunched?.();
      },
      steps.length * 1400 + 600,
    );
  };

  const handleReset = () => {
    setPipeline([]);
    setIsComplete(false);
    setNiche("");
  };

  return (
    <div className="space-y-5">
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
                  Campaign Pipeline
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
                        <AnimatePresence>
                          {step.status === "done" && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-mono text-muted-foreground mt-0.5 truncate"
                            >
                              {step.output}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
