import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Eye,
  Key,
  Loader2,
  Lock,
  MousePointerClick,
  Package,
  Settings2,
  Shield,
  Target,
  Timer,
  TrendingUp,
  Unlock,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useGetAllAgentLogs,
  useGetCallerAppLicense,
  useGetCloneProtectionSettings,
  useGetOfferPerformanceSummary,
  useIsCallerAdmin,
  useIsOwnerCertified,
  useStartRecurringTimer,
  useUpdateCloneProtection,
} from "../hooks/useQueries";
import AddOfferForm from "./AddOfferForm";
import ApiKeysSettings from "./ApiKeysSettings";

interface AdminDashboardProps {
  onLaunchCampaign?: (niche: string) => void;
}

export default function AdminDashboard({
  onLaunchCampaign,
}: AdminDashboardProps) {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: cloneSettings, isLoading: settingsLoading } =
    useGetCloneProtectionSettings();
  const { data: license, isLoading: licenseLoading } = useGetCallerAppLicense();
  const { data: isCertified } = useIsOwnerCertified();
  const { data: logs } = useGetAllAgentLogs();
  const { data: performanceSummary } = useGetOfferPerformanceSummary();
  const updateSettings = useUpdateCloneProtection();
  const startTimer = useStartRecurringTimer();

  const [sellingPrice, setSellingPrice] = useState("");
  const [cloneProtectionEnabled, setCloneProtectionEnabled] = useState(false);
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);

  useEffect(() => {
    if (cloneSettings) {
      setSellingPrice(
        (Number(cloneSettings.sellingPriceCents) / 100).toFixed(2),
      );
      setCloneProtectionEnabled(cloneSettings.cloneProtectionEnabled);
      setDemoModeEnabled(cloneSettings.demoModeEnabled);
    }
  }, [cloneSettings]);

  const handleSaveSettings = () => {
    updateSettings.mutate({
      sellingPriceCents: BigInt(
        Math.round(Number.parseFloat(sellingPrice || "0") * 100),
      ),
      cloneProtectionEnabled,
      demoModeEnabled,
    });
  };

  const metrics = (() => {
    const totalRevenue = Number(performanceSummary?.revenueTotals ?? 0n) / 100;
    const totalClicks =
      performanceSummary?.clickCounts.reduce((s, [, c]) => s + Number(c), 0) ??
      0;
    const avgConvRate = performanceSummary?.conversionRates.length
      ? performanceSummary.conversionRates.reduce((s, [, r]) => s + r, 0) /
        performanceSummary.conversionRates.length
      : 0;
    const allLogs = logs
      ? [...logs.habit, ...logs.affiliate, ...logs.copy, ...logs.analytics]
      : [];
    const successRate = allLogs.length
      ? (allLogs.filter((l) => !l.toLowerCase().includes("error")).length /
          allLogs.length) *
        100
      : 0;
    return {
      totalRevenue,
      totalClicks,
      avgConvRate,
      successRate,
      logCount: allLogs.length,
    };
  })();

  if (adminLoading || settingsLoading || licenseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold font-display">Admin Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Monetization, offers, API keys, and system controls
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Badge className="gap-1.5 bg-chart-2/15 text-chart-2 border-chart-2/25">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              Limited access
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList
          data-ocid="admin.tab"
          className="grid w-full grid-cols-3 bg-card/80 border border-border"
        >
          <TabsTrigger value="overview" data-ocid="admin.overview.tab">
            <Activity className="h-4 w-4 mr-1.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="offers" data-ocid="admin.offers.tab">
            <Package className="h-4 w-4 mr-1.5" />
            Offers
          </TabsTrigger>
          <TabsTrigger value="settings" data-ocid="admin.settings.tab">
            <Settings2 className="h-4 w-4 mr-1.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ─────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Total Earnings",
                value: `$${metrics.totalRevenue.toFixed(2)}`,
                sub: `From ${Number(performanceSummary?.totalOffers ?? 0n)} offers`,
                icon: DollarSign,
                color: "text-chart-2",
              },
              {
                label: "Total Clicks",
                value: metrics.totalClicks.toLocaleString(),
                sub: "Across all offers",
                icon: MousePointerClick,
                color: "text-primary",
              },
              {
                label: "Avg Conversion",
                value: `${(metrics.avgConvRate * 100).toFixed(1)}%`,
                sub: "Average rate",
                icon: Target,
                color: "text-chart-3",
              },
              {
                label: "Agent Success",
                value: `${metrics.successRate.toFixed(0)}%`,
                sub: `${metrics.logCount} total runs`,
                icon: Activity,
                color: "text-chart-4",
              },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <Card key={label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <Icon className={`h-4 w-4 ${color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{value}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* License info */}
          {license && (
            <Card className="border-chart-1/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-chart-1" />
                  License Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="default" className="capitalize">
                    {license.licenseType}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Purchased
                  </span>
                  <span className="text-sm font-mono">
                    {new Date(
                      Number(license.purchaseTime) / 1_000_000,
                    ).toLocaleDateString()}
                  </span>
                </div>
                {license.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Expires
                    </span>
                    <span className="text-sm font-mono">
                      {new Date(
                        Number(license.expiresAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Offers Tab ───────────────────────────────────── */}
        <TabsContent value="offers" className="space-y-6">
          {!isAdmin ? (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6 pb-6 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="font-medium">Admin required</p>
                  <p className="text-sm text-muted-foreground">
                    You need admin privileges to manage offers. Connect with the
                    app owner principal.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AddOfferForm onLaunchCampaign={onLaunchCampaign} />
          )}
        </TabsContent>

        {/* ── Settings Tab ─────────────────────────────────── */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* API Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Key className="h-4 w-4 text-primary" />
                  Affiliate API Keys
                </CardTitle>
                <CardDescription>
                  Connect your ClickBank and JVZoo accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiKeysSettings />
              </CardContent>
            </Card>

            {/* Auto-run timer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Timer className="h-4 w-4 text-chart-3" />
                  Automation
                </CardTitle>
                <CardDescription>
                  Schedule agents to run automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Start the recurring timer to automatically run all agents
                  every 10 seconds. This keeps your system continuously learning
                  and adapting.
                </p>
                <Button
                  data-ocid="settings.timer.button"
                  onClick={() => startTimer.mutate()}
                  disabled={startTimer.isPending}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Timer className="h-4 w-4" />
                  {startTimer.isPending
                    ? "Starting..."
                    : "Start Auto-Run (every 10s)"}
                </Button>
              </CardContent>
            </Card>

            {/* Monetization settings */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-chart-1" />
                  Monetization & Clone Protection
                </CardTitle>
                <CardDescription>
                  Configure app licensing and the Caffeine App Market
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price (USD)</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Input
                        id="sellingPrice"
                        data-ocid="settings.price.input"
                        type="number"
                        step="0.01"
                        min="0"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        placeholder="0.00"
                        className="bg-card"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Price for users to clone your app
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="cloneProtection">
                          Clone Protection
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Only authorized copies can deploy
                        </p>
                      </div>
                      <Switch
                        id="cloneProtection"
                        data-ocid="settings.clone_protection.switch"
                        checked={cloneProtectionEnabled}
                        onCheckedChange={setCloneProtectionEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="demoMode">Free Demo Access</Label>
                        <p className="text-xs text-muted-foreground">
                          Allow users to try before buying
                        </p>
                      </div>
                      <Switch
                        id="demoMode"
                        data-ocid="settings.demo_mode.switch"
                        checked={demoModeEnabled}
                        onCheckedChange={setDemoModeEnabled}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={isCertified ? "default" : "secondary"}>
                      {isCertified ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" /> Certified
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3 w-3" /> Not Certified
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Protection:</span>
                    <Badge variant="outline">
                      {cloneProtectionEnabled ? (
                        <>
                          <Lock className="mr-1 h-3 w-3" /> Enabled
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-1 h-3 w-3" /> Disabled
                        </>
                      )}
                    </Badge>
                  </div>
                  {demoModeEnabled && (
                    <Badge variant="outline">
                      <Eye className="mr-1 h-3 w-3" /> Demo Active
                    </Badge>
                  )}
                </div>

                <Button
                  data-ocid="settings.monetization.save_button"
                  onClick={handleSaveSettings}
                  disabled={updateSettings.isPending}
                  className="gap-2"
                >
                  {updateSettings.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      Save Monetization Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
