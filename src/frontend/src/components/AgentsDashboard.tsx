import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Play,
  PlayCircle,
  Terminal,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { AgentType } from "../backend";
import {
  useGetAllAgentLogs,
  useGetAllAutomationStatuses,
  useGetOfferPerformanceSummary,
  useRunAgent,
  useRunAllAgents,
} from "../hooks/useQueries";

/* ── Agent Config ──────────────────────────────────────────── */
const agentTypeConfig = {
  [AgentType.habit]: {
    label: "Funnel Agent",
    sublabel: "FUNNEL BUILDER",
    icon: Brain,
    gradientFrom: "#7c3aed",
    gradientTo: "#4f46e5",
    cssColor: "from-violet-600 to-indigo-600",
    glowClass: "glow-purple",
    accentClass: "text-chart-3",
    bgAccent: "bg-chart-3/10 border-chart-3/20",
    lastOutput: "Funnel mapped | 3 steps: Traffic → Bridge → Offer",
    description: "Maps and optimizes conversion funnels",
  },
  [AgentType.affiliate]: {
    label: "Affiliate Agent",
    sublabel: "OFFER DISCOVERY",
    icon: TrendingUp,
    gradientFrom: "#059669",
    gradientTo: "#0284c7",
    cssColor: "from-emerald-600 to-sky-600",
    glowClass: "glow-green",
    accentClass: "text-chart-2",
    bgAccent: "bg-chart-2/10 border-chart-2/20",
    lastOutput: "Found 3 offers | Top: JavaBurn (gravity: 110, payout: $42)",
    description: "Discovers and ranks affiliate offers",
  },
  [AgentType.copy]: {
    label: "Copy Agent",
    sublabel: "CONTENT WRITER",
    icon: FileText,
    gradientFrom: "#2563eb",
    gradientTo: "#4f46e5",
    cssColor: "from-blue-600 to-indigo-600",
    glowClass: "glow-blue",
    accentClass: "text-primary",
    bgAccent: "bg-primary/10 border-primary/20",
    lastOutput:
      'Generated landing page | Headline: "The System Behind JavaBurn\'s Breakthrough Results"',
    description: "Writes high-converting copy & pages",
  },
  [AgentType.analytics]: {
    label: "Analytics Agent",
    sublabel: "DATA INSIGHTS",
    icon: BarChart,
    gradientFrom: "#9333ea",
    gradientTo: "#db2777",
    cssColor: "from-purple-600 to-pink-600",
    glowClass: "glow-purple",
    accentClass: "text-chart-4",
    bgAccent: "bg-chart-4/10 border-chart-4/20",
    lastOutput: "Analyzed 5 data points | Best niche: weight loss (82% score)",
    description: "Analyzes data & evolves strategies",
  },
};

const allAgentTypes = [
  AgentType.affiliate,
  AgentType.habit,
  AgentType.copy,
  AgentType.analytics,
];

export default function AgentsDashboard() {
  const { data: logs, isLoading: logsLoading } = useGetAllAgentLogs();
  const { data: automationStatuses, isLoading: statusesLoading } =
    useGetAllAutomationStatuses();
  const { data: performanceSummary } = useGetOfferPerformanceSummary();
  const runAgent = useRunAgent();
  const runAllAgents = useRunAllAgents();

  const [executingAgents, setExecutingAgents] = useState<Set<AgentType>>(
    new Set(),
  );
  const [thinkingProgress, setThinkingProgress] = useState<
    Record<string, number>
  >({});

  const isLoading = logsLoading || statusesLoading;

  useEffect(() => {
    if (executingAgents.size === 0) return;
    const interval = setInterval(() => {
      setThinkingProgress((prev) => {
        const next = { ...prev };
        for (const agent of executingAgents) {
          next[agent] = Math.min(95, (prev[agent] || 0) + Math.random() * 12);
        }
        return next;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [executingAgents]);

  const handleRunAgent = (agentType: AgentType) => {
    setExecutingAgents((prev) => new Set(prev).add(agentType));
    setThinkingProgress((prev) => ({ ...prev, [agentType]: 0 }));
    runAgent.mutate(agentType, {
      onSettled: () => {
        setThinkingProgress((prev) => ({ ...prev, [agentType]: 100 }));
        setTimeout(() => {
          setExecutingAgents((prev) => {
            const s = new Set(prev);
            s.delete(agentType);
            return s;
          });
          setThinkingProgress((prev) => {
            const n = { ...prev };
            delete n[agentType];
            return n;
          });
        }, 800);
      },
    });
  };

  const handleRunAll = () => {
    for (const t of allAgentTypes) {
      setExecutingAgents((prev) => new Set(prev).add(t));
      setThinkingProgress((prev) => ({ ...prev, [t]: 0 }));
    }
    runAllAgents.mutate(undefined, {
      onSettled: () => {
        for (const t of allAgentTypes) {
          setThinkingProgress((prev) => ({ ...prev, [t]: 100 }));
        }
        setTimeout(() => {
          setExecutingAgents(new Set());
          setThinkingProgress({});
        }, 1000);
      },
    });
  };

  const getStatus = (agentType: AgentType) => {
    const isExec = executingAgents.has(agentType);
    const status = automationStatuses?.find(([t]) => t === agentType)?.[1];
    if (isExec || status?.running) return "running";
    if (status?.lastRun) {
      const ms = Date.now() - Number(status.lastRun) / 1_000_000;
      if (ms < 20_000) return "done";
    }
    return "idle";
  };

  const getLogs = (a: AgentType) => logs?.[a] ?? [];
  const getRunCount = (a: AgentType) => getLogs(a).length;

  const runningCount = allAgentTypes.filter((t) => {
    const s = automationStatuses?.find(([ty]) => ty === t)?.[1];
    return executingAgents.has(t) || s?.running;
  }).length;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["a", "b", "c", "d"].map((k) => (
          <Card key={k} className="overflow-hidden">
            <div className="h-1.5 bg-muted animate-pulse" />
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold font-display tracking-tight">
            Agent Command Grid
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
            {runningCount > 0 ? (
              <>
                <Zap className="h-3.5 w-3.5 animate-pulse text-chart-2" />
                {runningCount} of {allAgentTypes.length} agents actively
                processing
              </>
            ) : (
              <>{allAgentTypes.length} agents standing by</>
            )}
          </p>
        </div>
        <Button
          data-ocid="agents.primary_button"
          onClick={handleRunAll}
          disabled={runAllAgents.isPending || executingAgents.size > 0}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          size="lg"
        >
          {runAllAgents.isPending || executingAgents.size > 0 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Activating...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" /> Activate All Agents
            </>
          )}
        </Button>
      </div>

      {/* Agent Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {allAgentTypes.map((agentType, agentIdx) => {
          const cfg = agentTypeConfig[agentType];
          const Icon = cfg.icon;
          const status = getStatus(agentType);
          const isExec = executingAgents.has(agentType);
          const progress = thinkingProgress[agentType] ?? 0;
          const runCount = getRunCount(agentType);
          const agentLogs = getLogs(agentType);
          const lastLog = agentLogs[agentLogs.length - 1] ?? cfg.lastOutput;
          const autoStatus = automationStatuses?.find(
            ([t]) => t === agentType,
          )?.[1];
          const totalExec = Number(autoStatus?.totalExecutions ?? 0);
          const lastRun = autoStatus?.lastRun;

          return (
            <motion.div
              key={agentType}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: agentIdx * 0.06 }}
            >
              <Card
                className={`relative overflow-hidden h-full transition-all duration-300 ${
                  status === "running"
                    ? `${cfg.glowClass} border-primary/30`
                    : "hover:border-border/60"
                }`}
              >
                {/* Gradient bar */}
                <div
                  className={`h-1 w-full bg-gradient-to-r ${cfg.cssColor} ${status === "running" ? "animate-pulse" : ""}`}
                />

                <CardContent className="pt-4 pb-4 space-y-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.cssColor} shadow-lg transition-all ${status === "running" ? "scale-110" : ""}`}
                        style={
                          status === "running"
                            ? {
                                boxShadow: `0 0 16px ${cfg.gradientFrom}66`,
                              }
                            : {}
                        }
                      >
                        {isExec ? (
                          <Loader2 className="h-5 w-5 text-white animate-spin" />
                        ) : (
                          <Icon className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">
                          {cfg.label}
                        </p>
                        <p className="text-[10px] font-mono tracking-wider text-muted-foreground">
                          {cfg.sublabel}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <Badge
                      className={`text-xs ${
                        status === "running"
                          ? "bg-primary/15 text-primary border-primary/30 animate-pulse"
                          : status === "done"
                            ? "bg-chart-2/15 text-chart-2 border-chart-2/30"
                            : "bg-muted/50 text-muted-foreground border-border"
                      }`}
                    >
                      {status === "running"
                        ? "● Running"
                        : status === "done"
                          ? "✓ Done"
                          : "○ Idle"}
                    </Badge>
                  </div>

                  {/* Progress bar when running */}
                  {isExec && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-mono">
                          processing...
                        </span>
                        <span className="text-primary font-mono">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}

                  {/* Last output */}
                  <div className={`rounded-lg border p-3 ${cfg.bgAccent}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Terminal className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        Last Output
                      </span>
                    </div>
                    <p className="text-xs font-mono text-foreground leading-relaxed line-clamp-3">
                      {lastLog}
                    </p>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-muted/30 py-2">
                      <p className="text-xs text-muted-foreground font-mono">
                        RUNS
                      </p>
                      <p className="text-lg font-bold tabular-nums">
                        {runCount}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted/30 py-2">
                      <p className="text-xs text-muted-foreground font-mono">
                        EXEC
                      </p>
                      <p className="text-lg font-bold tabular-nums">
                        {totalExec}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted/30 py-2">
                      <p className="text-xs text-muted-foreground font-mono">
                        STATUS
                      </p>
                      <p className="text-lg font-bold">
                        {status === "running" ? (
                          <span className="text-primary">●</span>
                        ) : status === "done" ? (
                          <CheckCircle2 className="h-5 w-5 text-chart-2 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Last run time */}
                  {lastRun && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Clock className="h-3 w-3" />
                      {new Date(
                        Number(lastRun) / 1_000_000,
                      ).toLocaleTimeString()}
                    </p>
                  )}

                  {/* Log preview */}
                  {agentLogs.length > 0 && (
                    <ScrollArea className="h-16 rounded-md bg-card/50 border border-border p-2">
                      <div className="space-y-0.5">
                        {agentLogs
                          .slice(-4)
                          .reverse()
                          .map((log) => (
                            <p
                              key={log}
                              className="text-[10px] font-mono text-muted-foreground leading-tight"
                            >
                              {log}
                            </p>
                          ))}
                      </div>
                    </ScrollArea>
                  )}

                  {/* Activate button */}
                  <Button
                    data-ocid={`agents.activate.button.${agentIdx + 1}`}
                    variant="outline"
                    size="sm"
                    className={`w-full gap-2 transition-all ${
                      isExec
                        ? "border-primary/40 text-primary bg-primary/10"
                        : "hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                    }`}
                    onClick={() => handleRunAgent(agentType)}
                    disabled={isExec || runAgent.isPending}
                  >
                    {isExec ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" /> Activate
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Affiliate performance summary bar */}
      {performanceSummary && Number(performanceSummary.totalOffers) > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-chart-2/20 bg-chart-2/5 px-5 py-4 flex flex-wrap gap-6 items-center"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-chart-2" />
            <span className="text-sm font-semibold text-chart-2">
              Live Campaign Metrics
            </span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <span>
              <span className="text-muted-foreground">Offers: </span>
              <span className="font-bold">
                {Number(performanceSummary.totalOffers)}
              </span>
            </span>
            <span>
              <span className="text-muted-foreground">Clicks: </span>
              <span className="font-bold">
                {performanceSummary.clickCounts
                  .reduce((s, [, c]) => s + Number(c), 0)
                  .toLocaleString()}
              </span>
            </span>
            <span>
              <span className="text-muted-foreground">Revenue: </span>
              <span className="font-bold text-chart-2">
                ${(Number(performanceSummary.revenueTotals) / 100).toFixed(2)}
              </span>
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
