import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useGetOfferPerformanceSummary,
  useGetAllOffers,
} from '../hooks/useQueries';
import { 
  TrendingUp, 
  MousePointerClick, 
  DollarSign, 
  Target,
  Package,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';

export default function AffiliatePerformance() {
  const { data: performanceSummary, isLoading: summaryLoading } = useGetOfferPerformanceSummary();
  const { data: offers, isLoading: offersLoading } = useGetAllOffers();

  const isLoading = summaryLoading || offersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const totalClicks = performanceSummary?.clickCounts.reduce((sum, [_, clicks]) => sum + Number(clicks), 0) || 0;
  const avgConversionRate = performanceSummary?.conversionRates.length 
    ? performanceSummary.conversionRates.reduce((sum, [_, rate]) => sum + rate, 0) / performanceSummary.conversionRates.length 
    : 0;
  const totalRevenue = Number(performanceSummary?.revenueTotals || 0n) / 100;
  const activeOffers = Number(performanceSummary?.totalOffers || 0n);

  // Combine offer data with performance metrics
  const offerPerformanceData = offers?.map(offer => {
    const clicks = performanceSummary?.clickCounts.find(([id]) => id === offer.id)?.[1] || 0n;
    const conversionRate = performanceSummary?.conversionRates.find(([id]) => id === offer.id)?.[1] || 0;
    const metrics = performanceSummary?.allMetrics.find(m => {
      // Match by comparing timestamps or other unique identifiers
      return Number(m.clickCount) === Number(clicks);
    });
    
    return {
      offer,
      clicks: Number(clicks),
      conversionRate,
      revenue: metrics ? Number(metrics.revenueTotal) / 100 : 0,
      lastUpdated: metrics?.lastUpdated,
    };
  }).sort((a, b) => b.clicks - a.clicks) || [];

  const topPerformer = offerPerformanceData[0];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-chart-2" />
          Affiliate Performance Tracking
        </h3>
        <p className="text-sm text-muted-foreground">
          Real-time metrics for promoted offers and conversion performance
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-chart-1 to-chart-2 animate-pulse" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <Package className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOffers}</div>
            <p className="text-xs text-muted-foreground">Currently promoted</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-chart-2 to-chart-3 animate-pulse" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all offers</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-chart-3 to-chart-4 animate-pulse" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <Target className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgConversionRate * 100).toFixed(1)}%</div>
            <Progress value={avgConversionRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-chart-4 to-chart-5 animate-pulse" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From conversions</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performer Highlight */}
      {topPerformer && (
        <Card className="border-chart-2 bg-gradient-to-br from-chart-2/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-chart-2 to-chart-3">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">Top Performing Offer</CardTitle>
                  <CardDescription>Highest click count</CardDescription>
                </div>
              </div>
              <Badge variant="default" className="gap-1">
                <ArrowUpRight className="h-3 w-3" />
                Best
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Product ID</p>
                <p className="font-medium">{topPerformer.offer.productId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-lg font-bold text-chart-2">{topPerformer.clicks.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-lg font-bold text-chart-3">{(topPerformer.conversionRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold text-chart-4">${topPerformer.revenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Offer Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Offer Performance Details
          </CardTitle>
          <CardDescription>
            Click counts, conversion rates, and revenue by offer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {offerPerformanceData.length > 0 ? (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {offerPerformanceData.map((data, index) => {
                  const isTopPerformer = index === 0;
                  const trendIcon = data.conversionRate > avgConversionRate ? ArrowUpRight : ArrowDownRight;
                  const TrendIcon = trendIcon;
                  const trendColor = data.conversionRate > avgConversionRate ? 'text-chart-2' : 'text-muted-foreground';
                  
                  return (
                    <Card key={data.offer.id} className={`p-4 ${isTopPerformer ? 'border-chart-2 bg-chart-2/5' : ''}`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Product: {data.offer.productId}</p>
                              {isTopPerformer && (
                                <Badge variant="default" className="text-xs">
                                  <Zap className="mr-1 h-3 w-3" />
                                  Top
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Price: ${(Number(data.offer.priceInCents) / 100).toFixed(2)}</span>
                              <span>Commission: {(data.offer.commissionRate * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MousePointerClick className="h-3 w-3" />
                              Clicks
                            </div>
                            <p className="text-lg font-bold">{data.clicks.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Target className="h-3 w-3" />
                              Conversion
                            </div>
                            <p className="text-lg font-bold">{(data.conversionRate * 100).toFixed(1)}%</p>
                            <Progress value={data.conversionRate * 100} className="h-1" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <DollarSign className="h-3 w-3" />
                              Revenue
                            </div>
                            <p className="text-lg font-bold">${data.revenue.toFixed(2)}</p>
                          </div>
                        </div>

                        {data.lastUpdated && (
                          <p className="text-xs text-muted-foreground">
                            Last updated: {new Date(Number(data.lastUpdated) / 1000000).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No performance data yet. Agents will track metrics as offers are promoted.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

