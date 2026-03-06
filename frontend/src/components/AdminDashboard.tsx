import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useGetCloneProtectionSettings, 
  useUpdateCloneProtection, 
  useGetAllOffers,
  useGetCallerAppLicense,
  useIsOwnerCertified,
  useGetAllAgentLogs,
  useGetAllAutomationStatuses,
  useRunAgent,
  useGetOfferPerformanceSummary,
} from '../hooks/useQueries';
import { 
  DollarSign, 
  Shield, 
  TrendingUp, 
  Package, 
  Eye,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Play,
  Loader2,
  BarChart3,
  FileText,
  Brain,
  Target,
  MousePointerClick,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AgentType } from '../backend';
import { ScrollArea } from '@/components/ui/scroll-area';
import AffiliatePerformance from './AffiliatePerformance';

export default function AdminDashboard() {
  const { data: cloneSettings, isLoading: settingsLoading } = useGetCloneProtectionSettings();
  const { data: offers, isLoading: offersLoading } = useGetAllOffers();
  const { data: license, isLoading: licenseLoading } = useGetCallerAppLicense();
  const { data: isCertified, isLoading: certifiedLoading } = useIsOwnerCertified();
  const { data: logs } = useGetAllAgentLogs();
  const { data: automationStatuses } = useGetAllAutomationStatuses();
  const { data: performanceSummary } = useGetOfferPerformanceSummary();
  const updateSettings = useUpdateCloneProtection();
  const runAgent = useRunAgent();

  const [sellingPrice, setSellingPrice] = useState('');
  const [cloneProtectionEnabled, setCloneProtectionEnabled] = useState(false);
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [executingAgents, setExecutingAgents] = useState<Set<AgentType>>(new Set());

  // Initialize form when settings load
  useState(() => {
    if (cloneSettings) {
      setSellingPrice((Number(cloneSettings.sellingPriceCents) / 100).toFixed(2));
      setCloneProtectionEnabled(cloneSettings.cloneProtectionEnabled);
      setDemoModeEnabled(cloneSettings.demoModeEnabled);
    }
  });

  const handleSaveSettings = () => {
    const priceCents = Math.round(parseFloat(sellingPrice || '0') * 100);
    updateSettings.mutate({
      sellingPriceCents: BigInt(priceCents),
      cloneProtectionEnabled,
      demoModeEnabled,
    });
  };

  const handleRunAgent = (agentType: AgentType) => {
    setExecutingAgents(prev => new Set(prev).add(agentType));
    runAgent.mutate(agentType, {
      onSettled: () => {
        setTimeout(() => {
          setExecutingAgents(prev => {
            const next = new Set(prev);
            next.delete(agentType);
            return next;
          });
        }, 1000);
      },
    });
  };

  // Calculate revenue metrics from offers and performance data
  const calculateRevenueMetrics = () => {
    const totalRevenue = Number(performanceSummary?.revenueTotals || 0n) / 100;
    const totalClicks = performanceSummary?.clickCounts.reduce((sum, [_, clicks]) => sum + Number(clicks), 0) || 0;
    const avgConversionRate = performanceSummary?.conversionRates.length 
      ? performanceSummary.conversionRates.reduce((sum, [_, rate]) => sum + rate, 0) / performanceSummary.conversionRates.length 
      : 0;

    const now = Date.now() * 1000000;
    const activeOffers = offers?.filter(offer => !offer.endDate || Number(offer.endDate) > now).length || 0;

    const dailyPerformance = totalRevenue / Math.max(activeOffers, 1);

    const bestPerformingOffer = performanceSummary?.clickCounts.length 
      ? performanceSummary.clickCounts.reduce((best, current) => 
          Number(current[1]) > Number(best[1]) ? current : best
        )[0]
      : null;

    return {
      totalEarnings: totalRevenue,
      dailyPerformance,
      bestPerformingOffer,
      activeOffers,
      totalClicks,
      avgConversionRate,
    };
  };

  const metrics = calculateRevenueMetrics();

  // Calculate agent statistics
  const calculateAgentStats = () => {
    if (!logs) return { totalRuns: 0, successRate: 0 };
    const allLogs = [...logs.habit, ...logs.affiliate, ...logs.copy, ...logs.analytics];
    const totalRuns = allLogs.length;
    const successRuns = allLogs.filter(log => !log.toLowerCase().includes('error')).length;
    const successRate = totalRuns > 0 ? (successRuns / totalRuns) * 100 : 0;
    return { totalRuns, successRate };
  };

  const agentStats = calculateAgentStats();

  const aiAssistants = [
    { type: AgentType.affiliate, name: 'Affiliate Agent', icon: TrendingUp, color: 'from-chart-2 to-chart-3' },
    { type: AgentType.copy, name: 'Copy Agent', icon: FileText, color: 'from-chart-3 to-chart-4' },
    { type: AgentType.analytics, name: 'Analytics Agent', icon: BarChart3, color: 'from-chart-4 to-chart-5' },
    { type: AgentType.habit, name: 'Learning Agent', icon: Brain, color: 'from-chart-1 to-chart-2' },
  ];

  if (settingsLoading || offersLoading || licenseLoading || certifiedLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold">Admin Dashboard</h3>
        <p className="text-sm text-muted-foreground">
          Manage monetization, affiliate operations, and AI assistants
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Affiliate Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalEarnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">From {metrics.activeOffers} active offers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <MousePointerClick className="h-4 w-4 text-chart-3" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalClicks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all offers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(metrics.avgConversionRate * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Average across offers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agent Success Rate</CardTitle>
                <Activity className="h-4 w-4 text-chart-1" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agentStats.successRate.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">{agentStats.totalRuns} total runs</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* AI Assistants Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Assistants
                </CardTitle>
                <CardDescription>
                  Trigger and monitor your AI agents for affiliate operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {aiAssistants.map((assistant) => {
                      const Icon = assistant.icon;
                      const isExecuting = executingAgents.has(assistant.type);
                      const status = automationStatuses?.find(([type]) => type === assistant.type)?.[1];
                      
                      return (
                        <Card key={assistant.type} className="overflow-hidden">
                          <div className={`h-1 bg-gradient-to-r ${assistant.color} ${isExecuting ? 'animate-pulse' : ''}`} />
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${assistant.color}`}>
                                  {isExecuting ? (
                                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                                  ) : (
                                    <Icon className="h-5 w-5 text-white" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{assistant.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {status?.lastRun 
                                      ? `Last run: ${new Date(Number(status.lastRun) / 1000000).toLocaleTimeString()}`
                                      : 'Never run'}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRunAgent(assistant.type)}
                                disabled={isExecuting || runAgent.isPending}
                              >
                                {isExecuting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Affiliate Offers Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Affiliate Offers
                </CardTitle>
                <CardDescription>
                  Overview of your active affiliate offers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {offers && offers.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {offers.map((offer) => {
                        const now = Date.now() * 1000000;
                        const isActive = !offer.endDate || Number(offer.endDate) > now;
                        const clicks = performanceSummary?.clickCounts.find(([id]) => id === offer.id)?.[1] || 0n;
                        const conversionRate = performanceSummary?.conversionRates.find(([id]) => id === offer.id)?.[1] || 0;
                        
                        return (
                          <Card key={offer.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">Product ID: {offer.productId}</p>
                                  <Badge variant={isActive ? 'default' : 'secondary'}>
                                    {isActive ? 'Active' : 'Ended'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>Price: ${(Number(offer.priceInCents) / 100).toFixed(2)}</span>
                                  <span>Commission: {(offer.commissionRate * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MousePointerClick className="h-3 w-3" />
                                    {Number(clicks)} clicks
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {(conversionRate * 100).toFixed(1)}% conversion
                                  </span>
                                </div>
                              </div>
                              <TrendingUp className="h-5 w-5 text-chart-2" />
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
                    No affiliate offers yet. Your AI agents will create offers automatically.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <AffiliatePerformance />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Monetization Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Monetization Settings
                </CardTitle>
                <CardDescription>
                  Configure app licensing and clone protection for the Caffeine App Market
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price (USD)</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      max="9999.99"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Price for users to clone or license your app
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cloneProtection">Clone Protection</Label>
                    <p className="text-xs text-muted-foreground">
                      Only authorized copies can be deployed
                    </p>
                  </div>
                  <Switch
                    id="cloneProtection"
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
                    checked={demoModeEnabled}
                    onCheckedChange={setDemoModeEnabled}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Status:</span>
                    <Badge variant={isCertified ? 'default' : 'secondary'}>
                      {isCertified ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Certified
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3 w-3" />
                          Not Certified
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Protection:</span>
                    <Badge variant="outline">
                      {cloneProtectionEnabled ? (
                        <>
                          <Lock className="mr-1 h-3 w-3" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-1 h-3 w-3" />
                          Disabled
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Demo Mode:</span>
                    <Badge variant="outline">
                      {demoModeEnabled ? (
                        <>
                          <Eye className="mr-1 h-3 w-3" />
                          Active
                        </>
                      ) : (
                        'Inactive'
                      )}
                    </Badge>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSaveSettings}
                  disabled={updateSettings.isPending}
                >
                  {updateSettings.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* License Information */}
            {license && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Your License
                  </CardTitle>
                  <CardDescription>Current app license information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">License Type:</span>
                    <Badge variant="default" className="capitalize">
                      {license.licenseType}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Purchase Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(Number(license.purchaseTime) / 1000000).toLocaleDateString()}
                    </span>
                  </div>
                  {license.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Expires:</span>
                      <span className="text-sm font-medium">
                        {new Date(Number(license.expiresAt) / 1000000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

