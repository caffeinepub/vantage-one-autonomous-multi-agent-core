import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Brain,
  CheckCircle,
  Circle,
  Cpu,
  DollarSign,
  Loader2,
  MousePointerClick,
  PlayCircle,
  Radio,
  Target,
  Timer,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AgentType } from "../backend";
import {
  useGetAllAgentLogs,
  useGetAllAutomationStatuses,
  useGetCallerKnowledgeEntries,
  useGetOfferPerformanceSummary,
  useRunAllAgents,
  useStartRecurringTimer,
} from "../hooks/useQueries";

const agentLabels: Record<AgentType, string> = {
  [AgentType.habit]: "Funnel",
  [AgentType.affiliate]: "Affiliate",
  [AgentType.copy]: "Copy",
  [AgentType.analytics]: "Analytics",
};

const agentColors: Record<AgentType, string> = {
  [AgentType.habit]: "text-chart-3",
  [AgentType.affiliate]: "text-chart-2",
  [AgentType.copy]: "text-primary",
  [AgentType.analytics]: "text-chart-4",
};

const agentBadgeColors: Record<AgentType, string> = {
  [AgentType.habit]: "border-chart-3/30 text-chart-3 bg-chart-3/10",
  [AgentType.affiliate]: "border-chart-2/30 text-chart-2 bg-chart-2/10",
  [AgentType.copy]: "border-primary/30 text-primary bg-primary/10",
  [AgentType.analytics]: "border-chart-4/30 text-chart-4 bg-chart-4/10",
};

type UnifiedLogEntry = {
  agentType: AgentType;
  message: string;
  idx: number;
};

export default function SystemMonitor() {
  const { data: automationStatuses } = useGetAllAutomationStatuses();
  const { data: logs } = useGetAllAgentLogs();
  const { data: performanceSummary } = useGetOfferPerformanceSummary();
  const { data: knowledgeEntries = [] } = useGetCallerKnowledgeEntries();
  const runAllAgents = useRunAllAgents();
  const startTimer = useStartRecurringTimer();

  const [isExecutingAll, setIsExecutingAll] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const prevLogCountRef = useRef(0);

  // Detect new logs for LIVE badge
  useEffect(() => {
    if (!logs) return;
    const count =
      logs.habit.length +
      logs.affiliate.length +
      logs.copy.length +
      logs.analytics.length;
    if (count > prevLogCountRef.current) {
      prevLogCountRef.current = count;
      setLastUpdateTime(new Date());
      setIsLive(true);
      const t = setTimeout(() => setIsLive(false), 5000);
      return () => clearTimeout(t);
    }
  }, [logs]);

  const handleRunAll = () => {
    setIsExecutingAll(true);
    runAllAgents.mutate(undefined, {
      onSettled: () => setTimeout(() => setIsExecutingAll(false), 1500),
    });
  };

  const activeCount = isExecutingAll
    ? 4
    : (automationStatuses?.filter(([, s]) => {
        if (s.running) return true;
        if (s.lastRun)
          return Date.now() - Number(s.lastRun) / 1_000_000 < 10_000;
        return false;
      }).length ?? 0);

  const totalExecutions =
    automationStatuses?.reduce(
      (s, [, st]) => s + Number(st.totalExecutions),
      0,
    ) ?? 0;

  const globalStats = (() => {
    if (!logs) return { success: 0, failure: 0, total: 0 };
    const all = [
      ...logs.habit,
      ...logs.affiliate,
      ...logs.copy,
      ...logs.analytics,
    ];
    const total = all.length;
    const success = all.filter(
      (l) => !l.toLowerCase().includes("error"),
    ).length;
    return { success, failure: total - success, total };
  })();

  // Build a unified chronological log feed (interleaved by position index)
  const unifiedLogs: UnifiedLogEntry[] = (() => {
    if (!logs) return [];
    const entries: UnifiedLogEntry[] = [];
    const agentTypes = [
      AgentType.affiliate,
      AgentType.habit,
      AgentType.copy,
      AgentType.analytics,
    ] as AgentType[];
    for (const agentType of agentTypes) {
      const agentLogs = logs[agentType] ?? [];
      agentLogs.forEach((msg, idx) => {
        entries.push({ agentType, message: msg, idx });
      });
    }
    // Reverse to show most recent first (logs are ordered oldest-first)
    return entries.reverse().slice(0, 50);
  })();

  const systemHealth = Math.min(100, 70 + (activeCount / 4) * 30);
  const totalClicks =
    performanceSummary?.clickCounts.reduce((s, [, c]) => s + Number(c), 0) ?? 0;
  const totalRevenue = Number(performanceSummary?.revenueTotals ?? 0n) / 100;
  const avgConvRate = performanceSummary?.conversionRates.length
    ? performanceSummary.conversionRates.reduce((s, [, r]) => s + r, 0) /
      performanceSummary.conversionRates.length
    : 0;

  const formatLastUpdate = () => {
    if (!lastUpdateTime) return null;
    const diff = Math.floor((Date.now() - lastUpdateTime.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdateTime.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold font-display">Agent Logs</h3>
            {isLive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 rounded-full border border-chart-2/30 bg-chart-2/15 px-2.5 py-0.5"
              >
                <Radio className="h-3 w-3 text-chart-2 animate-pulse" />
                <span className="text-xs font-semibold text-chart-2">LIVE</span>
              </motion.div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount > 0
              ? `${activeCount} of 4 agents active — system processing`
              : lastUpdateTime
                ? `Last run: ${formatLastUpdate()}`
                : "Real-time health, metrics, and execution logs"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            data-ocid="monitor.run_all.button"
            variant="outline"
            className="gap-2"
            onClick={handleRunAll}
            disabled={isExecutingAll || runAllAgents.isPending}
          >
            {isExecutingAll || runAllAgents.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Running...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" /> Run All
              </>
            )}
          </Button>
          <Button
            data-ocid="monitor.timer.button"
            className="gap-2"
            onClick={() => startTimer.mutate()}
            disabled={startTimer.isPending}
          >
            <Timer className="h-4 w-4" />
            {startTimer.isPending ? "Starting..." : "Auto-Run (10s)"}
          </Button>
        </div>
      </div>

      {/* Top metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "System Health",
            value: `${systemHealth.toFixed(0)}%`,
            sub:
              activeCount > 0
                ? `${activeCount} agents active`
                : "All systems nominal",
            icon: Activity,
            color: "text-chart-2",
            progress: systemHealth,
          },
          {
            label: "Active Agents",
            value: `${activeCount}/4`,
            sub: activeCount > 0 ? "currently running" : "standing by",
            icon: Cpu,
            color: "text-primary",
            progress: (activeCount / 4) * 100,
          },
          {
            label: "Total Executions",
            value: totalExecutions.toString(),
            sub: `${globalStats.success} successful`,
            icon: Zap,
            color: "text-chart-3",
            progress: null,
          },
          {
            label: "Knowledge Entries",
            value: knowledgeEntries.length.toString(),
            sub: "shared intel entries",
            icon: Brain,
            color: "text-chart-4",
            progress: null,
          },
        ].map(({ label, value, sub, icon: Icon, color, progress }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display tabular-nums">
                  {value}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                {progress !== null && (
                  <Progress value={progress} className="mt-2 h-1" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue / Affiliate metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-chart-2/20 bg-chart-2/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-chart-2" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">total earned</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MousePointerClick className="h-4 w-4 text-primary" />
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              across all offers
            </p>
          </CardContent>
        </Card>
        <Card className="border-chart-3/20 bg-chart-3/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-chart-3" />
              Avg Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">
              {(avgConvRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent status grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(automationStatuses ?? []).map(([agentType, status]) => {
          const isActive = isExecutingAll || status.running;
          const recentlyRan = status.lastRun
            ? Date.now() - Number(status.lastRun) / 1_000_000 < 15_000
            : false;
          return (
            <Card
              key={agentType}
              className={`transition-all ${isActive ? "border-primary/30 bg-primary/5" : ""}`}
            >
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${agentColors[agentType]}`}
                  >
                    {agentLabels[agentType]} Agent
                  </span>
                  {isActive && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  )}
                </div>
                <Badge
                  variant={
                    isActive ? "default" : recentlyRan ? "secondary" : "outline"
                  }
                  className="text-xs w-full justify-center"
                >
                  {isActive ? "● Active" : recentlyRan ? "✓ Recent" : "○ Idle"}
                </Badge>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Runs</span>
                  <span className="font-mono font-medium">
                    {Number(status.totalExecutions)}
                  </span>
                </div>
                {status.lastRun && (
                  <p className="text-[10px] font-mono text-muted-foreground/70">
                    {new Date(
                      Number(status.lastRun) / 1_000_000,
                    ).toLocaleTimeString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Execution stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Execution Breakdown
            </CardTitle>
            <CardDescription>By agent type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(automationStatuses ?? []).map(([agentType, status]) => {
              const exec = Number(status.totalExecutions);
              const pct =
                totalExecutions > 0 ? (exec / totalExecutions) * 100 : 0;
              return (
                <div key={agentType} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className={agentColors[agentType]}>
                      {agentLabels[agentType]}
                    </span>
                    <span className="font-mono tabular-nums">{exec}</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
            {!automationStatuses?.length && (
              <p className="text-sm text-center text-muted-foreground py-4">
                No data yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Success vs Failure
            </CardTitle>
            <CardDescription>
              {globalStats.total} total log entries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-chart-2" />
                <span className="text-sm">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-chart-2">
                  {globalStats.success}
                </span>
                <Badge variant="outline" className="text-chart-2 text-xs">
                  {globalStats.total > 0
                    ? ((globalStats.success / globalStats.total) * 100).toFixed(
                        0,
                      )
                    : 0}
                  %
                </Badge>
              </div>
            </div>
            <Progress
              value={
                globalStats.total > 0
                  ? (globalStats.success / globalStats.total) * 100
                  : 0
              }
              className="h-2"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm">Failure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-destructive">
                  {globalStats.failure}
                </span>
                <Badge variant="outline" className="text-destructive text-xs">
                  {globalStats.total > 0
                    ? ((globalStats.failure / globalStats.total) * 100).toFixed(
                        0,
                      )
                    : 0}
                  %
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Live Log Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                Live Execution Logs
                {isLive && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-chart-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-2 animate-pulse inline-block" />
                    LIVE
                  </span>
                )}
              </CardTitle>
              <CardDescription className="mt-0.5">
                Unified real-time feed from all agents
                {lastUpdateTime && (
                  <span className="ml-2 font-mono">
                    · Last update: {formatLastUpdate()}
                  </span>
                )}
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {globalStats.total} entries
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 rounded-lg border border-border bg-card/50 p-3">
            {unifiedLogs.length > 0 ? (
              <div className="space-y-2">
                {unifiedLogs.map(({ agentType, message, idx }) => (
                  <div
                    key={`${agentType}-${idx}`}
                    className="flex items-start gap-2 text-xs"
                  >
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] py-0 capitalize ${agentBadgeColors[agentType]}`}
                    >
                      {agentLabels[agentType]}
                    </Badge>
                    <span className="font-mono text-muted-foreground leading-relaxed">
                      {message}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-ocid="monitor.logs.empty_state"
                className="flex h-full flex-col items-center justify-center gap-2 text-center"
              >
                <Circle className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No logs yet</p>
                <p className="text-xs text-muted-foreground/60">
                  Run agents or launch a campaign to see activity here
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
