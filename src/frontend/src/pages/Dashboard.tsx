import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  BarChart,
  BarChart3,
  Brain,
  FileText,
  Network,
  Package,
  Rocket,
  Settings,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AgentType } from "../backend";
import type { KnowledgeEntry } from "../backend";
import AdminDashboard from "../components/AdminDashboard";
import AgentsDashboard from "../components/AgentsDashboard";
import CampaignLauncher from "../components/CampaignLauncher";
import NetworkVisualization from "../components/NetworkVisualization";
import SystemMonitor from "../components/SystemMonitor";
import {
  useGetAllAutomationStatuses,
  useGetCallerKnowledgeEntries,
  useGetCollaborationStats,
  useGetTotalActiveOffers,
} from "../hooks/useQueries";

type Tab = "command" | "performance" | "logs" | "admin";

export default function Dashboard() {
  const { data: automationStatuses } = useGetAllAutomationStatuses();
  const { data: collaborationStats } = useGetCollaborationStats(); // only populated for admins
  const { data: totalActiveOffers } = useGetTotalActiveOffers();
  const [activeTab, setActiveTab] = useState<Tab>("command");
  const [prefilledNiche, setPrefilledNiche] = useState<string | undefined>();

  const runningCount =
    automationStatuses?.filter(([, s]) => s.running).length ?? 0;
  const offerCount =
    totalActiveOffers !== undefined ? Number(totalActiveOffers) : null;
  const hasNoOffers = offerCount === 0;

  const handleGoToAdmin = () => {
    setActiveTab("admin");
  };

  const handleGoToCommandWithNiche = (niche: string) => {
    setPrefilledNiche(niche);
    setActiveTab("command");
  };

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

        {/* ── Setup Guide Banner ─────────────────────────────── */}
        <AnimatePresence>
          {hasNoOffers && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4"
              data-ocid="dashboard.setup_guide.panel"
            >
              <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-300">
                  Your first step: Add affiliate offers in the Admin tab →
                  Offers section.
                </p>
                <p className="text-xs text-amber-400/80 mt-1">
                  The agents need offers to pick from — without them, campaigns
                  can't select a product. Add at least one offer to get started.
                </p>
              </div>
              <Button
                data-ocid="dashboard.go_to_admin.button"
                size="sm"
                variant="outline"
                onClick={handleGoToAdmin}
                className="shrink-0 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/60"
              >
                Go to Admin → Offers
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Network Visualization (compact, always visible) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
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
          <div className="h-[260px] w-full">
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
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as Tab)}
            className="space-y-6"
          >
            <TabsList
              className="grid w-full max-w-2xl grid-cols-4 bg-card/80 border border-border"
              data-ocid="dashboard.tab"
            >
              <TabsTrigger
                value="command"
                data-ocid="dashboard.command.tab"
                className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <Rocket className="h-4 w-4" />
                <span className="hidden sm:inline">Command</span>
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                data-ocid="dashboard.performance.tab"
                className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Performance</span>
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                data-ocid="dashboard.logs.tab"
                className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Agent Logs</span>
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

            {/* ── Command Center ─────────────────────────────── */}
            <TabsContent value="command" className="space-y-6">
              {/* Campaign Launcher */}
              <div
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
                <CampaignLauncher
                  onGoToAdmin={handleGoToAdmin}
                  key={prefilledNiche}
                />
              </div>

              {/* Agents Dashboard */}
              <AgentsDashboard />
            </TabsContent>

            {/* ── Performance ────────────────────────────────── */}
            <TabsContent value="performance" className="space-y-6">
              <PerformanceTab onGoToAdmin={handleGoToAdmin} />
            </TabsContent>

            {/* ── Agent Logs ─────────────────────────────────── */}
            <TabsContent value="logs" className="space-y-6">
              <SystemMonitor />
            </TabsContent>

            {/* ── Admin ──────────────────────────────────────── */}
            <TabsContent value="admin" className="space-y-6">
              <AdminDashboard onLaunchCampaign={handleGoToCommandWithNiche} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, MousePointerClick, Target } from "lucide-react";
/* ── Performance Tab ──────────────────────────────────────── */
import {
  useGetAllOffers,
  useGetOfferPerformanceSummary,
} from "../hooks/useQueries";

function PerformanceTab({ onGoToAdmin }: { onGoToAdmin: () => void }) {
  const { data: offers = [] } = useGetAllOffers();
  const { data: performanceSummary } = useGetOfferPerformanceSummary();
  const { data: knowledgeEntries = [] } = useGetCallerKnowledgeEntries();

  const totalClicks =
    performanceSummary?.clickCounts.reduce((s, [, c]) => s + Number(c), 0) ?? 0;
  const totalRevenue = Number(performanceSummary?.revenueTotals ?? 0n) / 100;
  const avgConvRate = performanceSummary?.conversionRates.length
    ? performanceSummary.conversionRates.reduce((s, [, r]) => s + r, 0) /
      performanceSummary.conversionRates.length
    : 0;

  // Parse display name
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
      {/* Summary bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-chart-2/20 bg-chart-2/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-chart-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2 font-display">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              from {offers.length} offers
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MousePointerClick className="h-4 w-4 text-primary" />
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary font-display">
              {totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              across all offers
            </p>
          </CardContent>
        </Card>
        <Card className="border-chart-3/20 bg-chart-3/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-chart-3" />
              Avg Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3 font-display">
              {(avgConvRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">average rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Offers table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-chart-2" />
            Offer Performance
            <Badge variant="outline" className="ml-auto font-normal">
              {offers.length} offers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div
              data-ocid="performance.offers.empty_state"
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <TrendingUp className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-base font-semibold text-muted-foreground">
                No offers tracked yet
              </p>
              <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
                Add affiliate offers in the Admin tab to start tracking
                performance data.
              </p>
              <Button
                data-ocid="performance.go_to_admin.button"
                variant="outline"
                size="sm"
                onClick={onGoToAdmin}
                className="mt-4 gap-2"
              >
                <Settings className="h-3.5 w-3.5" />
                Go to Admin → Offers
              </Button>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table data-ocid="performance.offers.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Niche</TableHead>
                    <TableHead className="text-right">Payout</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Conv %</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
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

                    return (
                      <TableRow
                        key={offer.id}
                        data-ocid={`performance.offers.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {parsed.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {parsed.network}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {parsed.niche}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${(Number(offer.priceInCents) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(offer.commissionRate * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(clicks).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(convRate * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-chart-2 font-semibold">
                          ${(Number(rev) / 100).toFixed(2)}
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

      {/* Knowledge entries */}
      <KnowledgeCoreFeed entries={knowledgeEntries} isLoading={false} />
    </div>
  );
}

/* ── Knowledge Core Feed ──────────────────────────────────── */
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

function KnowledgeCoreFeed({
  entries,
  isLoading,
}: {
  entries: KnowledgeEntry[];
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold font-display">Agent Intelligence</h3>
          <p className="text-sm text-muted-foreground">
            Shared knowledge built by your agent network
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
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 py-12 text-center"
        >
          <Brain className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-base font-semibold text-muted-foreground">
            No intelligence entries yet
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
            Launch a campaign or run agents to build the knowledge base.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
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
