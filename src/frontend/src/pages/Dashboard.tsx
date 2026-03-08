import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, BookOpen, Rocket } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import CampaignResultsTab from "../components/CampaignResultsTab";
import CommandCenterTab from "../components/CommandCenterTab";
import NicheIntelTab from "../components/NicheIntelTab";
import type { CampaignResult } from "../data/affiliateData";
import { loadCampaigns, saveCampaigns } from "../data/affiliateData";

type Tab = "command" | "results" | "intel";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("command");
  const [campaigns, setCampaigns] = useState<CampaignResult[]>([]);

  // Load persisted campaigns on mount
  useEffect(() => {
    const saved = loadCampaigns();
    if (saved.length > 0) setCampaigns(saved);
  }, []);

  // Persist campaigns on change
  useEffect(() => {
    saveCampaigns(campaigns);
  }, [campaigns]);

  const handleNewCampaign = (result: CampaignResult) => {
    setCampaigns((prev) => [result, ...prev]);
  };

  const handleGoToResults = () => setActiveTab("results");

  return (
    <div className="grid-bg min-h-screen">
      <div className="container py-6 space-y-6 max-w-6xl">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-3xl font-black tracking-tight text-foreground text-glow-blue sm:text-4xl md:text-5xl">
                VANTAGE ONE
              </h1>
              <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-chart-2/30 bg-chart-2/10 px-3 py-1 text-xs font-mono text-chart-2 animate-active-badge">
                <span className="h-1.5 w-1.5 rounded-full bg-chart-2 animate-pulse inline-block" />
                AI ONLINE
              </span>
            </div>
            <p className="font-mono text-xs tracking-wider text-muted-foreground">
              Autonomous Affiliate Operating System · AI picks niches, offers &
              traffic
            </p>
          </div>
          <p className="text-xs font-mono text-muted-foreground/50 sm:text-right">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} run
          </p>
        </motion.div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as Tab)}
            className="space-y-5"
          >
            <TabsList
              className="grid w-full max-w-lg grid-cols-3 bg-card/80 border border-border"
              data-ocid="dashboard.tab"
            >
              <TabsTrigger
                value="command"
                data-ocid="dashboard.command.tab"
                className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <Rocket className="h-3.5 w-3.5" />
                <span>Command</span>
              </TabsTrigger>
              <TabsTrigger
                value="results"
                data-ocid="dashboard.results.tab"
                className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Results</span>
                {campaigns.length > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary leading-none">
                    {campaigns.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="intel"
                data-ocid="dashboard.intel.tab"
                className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Intel</span>
              </TabsTrigger>
            </TabsList>

            {/* Command Center */}
            <TabsContent value="command">
              <AnimatePresence mode="wait">
                <motion.div
                  key="command"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <CommandCenterTab
                    onNewCampaign={handleNewCampaign}
                    onGoToResults={handleGoToResults}
                    latestCampaign={campaigns[0]}
                  />
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* Campaign Results */}
            <TabsContent value="results">
              <AnimatePresence mode="wait">
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <CampaignResultsTab
                    campaigns={campaigns}
                    onRunNew={() => setActiveTab("command")}
                  />
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* Niche & Offer Intel */}
            <TabsContent value="intel">
              <AnimatePresence mode="wait">
                <motion.div
                  key="intel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <NicheIntelTab />
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
