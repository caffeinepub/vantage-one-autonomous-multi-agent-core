import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart3, Network, Rocket, Settings } from "lucide-react";
import { motion } from "motion/react";
import AdminDashboard from "../components/AdminDashboard";
import AgentsDashboard from "../components/AgentsDashboard";
import CampaignLauncher from "../components/CampaignLauncher";
import NetworkVisualization from "../components/NetworkVisualization";
import SystemMonitor from "../components/SystemMonitor";
import {
  useGetAllAutomationStatuses,
  useGetCollaborationStats,
} from "../hooks/useQueries";

export default function Dashboard() {
  const { data: automationStatuses } = useGetAllAutomationStatuses();
  const { data: collaborationStats } = useGetCollaborationStats();

  const runningCount =
    automationStatuses?.filter(([, s]) => s.running).length ?? 0;

  return (
    <div className="grid-bg min-h-screen">
      <div className="container py-8 space-y-8">
        {/* ── Hero ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-4xl font-black tracking-tight text-foreground text-glow-blue sm:text-5xl">
                VANTAGE ONE
              </h1>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                Autonomous AI Affiliate Operating System · Multi-Agent
                Intelligence
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                data-ocid="dashboard.status.toggle"
                className="gap-2 border-chart-2/30 bg-chart-2/10 px-4 py-2 text-chart-2 text-sm animate-active-badge"
              >
                <span className="h-2 w-2 rounded-full bg-chart-2 animate-pulse inline-block" />
                SYSTEM ACTIVE
              </Badge>
              {runningCount > 0 && (
                <Badge className="gap-1.5 border-primary/30 bg-primary/10 text-primary">
                  <Activity className="h-3 w-3 animate-pulse" />
                  {runningCount} running
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Campaign Launcher ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-primary/20 bg-card/80 p-5 backdrop-blur-sm shadow-lg"
          style={{ boxShadow: "0 0 32px oklch(0.72 0.19 218 / 0.06)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold tracking-tight">
              Campaign Launcher
            </h2>
            <span className="text-xs text-muted-foreground">
              Enter a niche to launch a full AI-driven funnel
            </span>
          </div>
          <CampaignLauncher />
        </motion.div>

        {/* ── Network Visualization ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm"
          style={{ boxShadow: "0 0 48px oklch(0.68 0.22 295 / 0.06)" }}
        >
          <div className="border-b border-border px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-chart-3" />
              <span className="text-sm font-semibold">
                Neural Agent Network
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Real-time collaboration visualization
            </span>
          </div>
          <div className="h-[320px] w-full">
            <NetworkVisualization
              automationStatuses={automationStatuses}
              collaborationStats={collaborationStats}
            />
          </div>
        </motion.div>

        {/* ── Main Tabs ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Tabs defaultValue="agents" className="space-y-6">
            <TabsList
              className="grid w-full max-w-2xl grid-cols-4 bg-card/80 border border-border"
              data-ocid="dashboard.tab"
            >
              <TabsTrigger
                value="agents"
                data-ocid="dashboard.agents.tab"
                className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Agents</span>
              </TabsTrigger>
              <TabsTrigger
                value="system"
                data-ocid="dashboard.system.tab"
                className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Monitor</span>
              </TabsTrigger>
              <TabsTrigger
                value="network"
                data-ocid="dashboard.network.tab"
                className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">Knowledge</span>
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                data-ocid="dashboard.admin.tab"
                className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="space-y-6">
              <AgentsDashboard />
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <SystemMonitor />
            </TabsContent>

            <TabsContent value="network" className="space-y-6">
              <KnowledgeCoreFeed />
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <AdminDashboard />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Brain, FileText, TrendingUp } from "lucide-react";
import { AgentType } from "../backend";
/* ── Knowledge Core Feed (inline for simplicity) ─────────── */
import { useGetCallerKnowledgeEntries } from "../hooks/useQueries";

const agentBadgeConfig: Record<
  AgentType,
  { label: string; color: string; icon: typeof Brain }
> = {
  [AgentType.habit]: {
    label: "Funnel",
    color: "text-chart-3 bg-chart-3/15 border-chart-3/25",
    icon: Brain,
  },
  [AgentType.affiliate]: {
    label: "Affiliate",
    color: "text-chart-2 bg-chart-2/15 border-chart-2/25",
    icon: TrendingUp,
  },
  [AgentType.copy]: {
    label: "Copy",
    color: "text-primary bg-primary/15 border-primary/25",
    icon: FileText,
  },
  [AgentType.analytics]: {
    label: "Analytics",
    color: "text-chart-4 bg-chart-4/15 border-chart-4/25",
    icon: BarChart,
  },
};

function KnowledgeCoreFeed() {
  const { data: entries = [], isLoading } = useGetCallerKnowledgeEntries();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold font-display">Knowledge Core</h3>
          <p className="text-sm text-muted-foreground">
            Shared intelligence built by your agent network
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          {entries.length} entries
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {["a", "b", "c", "d"].map((k) => (
            <div
              key={k}
              className="h-16 animate-pulse rounded-lg bg-muted/30"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div
          data-ocid="knowledge.empty_state"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 py-16 text-center"
        >
          <Brain className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <p className="text-base font-semibold text-muted-foreground">
            No knowledge entries yet
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
            Run your agents to start building the knowledge base. Each agent
            contributes insights, strategies, and performance data.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3 pr-2">
            {[...entries].reverse().map((entry, idx) => {
              const cfg =
                agentBadgeConfig[entry.sourceAgent] ??
                agentBadgeConfig[AgentType.analytics];
              const Icon = cfg.icon;
              const date = new Date(Number(entry.timestamp) / 1_000_000);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  data-ocid={`knowledge.item.${idx + 1}`}
                  className="flex gap-3 rounded-lg border border-border bg-card/60 p-3.5 hover:border-primary/20 transition-colors"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${cfg.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge
                        variant="outline"
                        className={`text-xs py-0 ${cfg.color}`}
                      >
                        {cfg.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs py-0 capitalize text-muted-foreground"
                      >
                        {entry.contentType}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {entry.content}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1 font-mono">
                      {date.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
