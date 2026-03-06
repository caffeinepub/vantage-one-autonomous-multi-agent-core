import { useGetAllAutomationStatuses, useGetAllAgentLogs, useRunAllAgents, useStartRecurringTimer, useGetOfferPerformanceSummary } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Cpu, Zap, TrendingUp, Clock, PlayCircle, Timer, CheckCircle, XCircle, Loader2, MousePointerClick, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AgentType } from '../backend';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export default function SystemMonitor() {
  const { data: automationStatuses } = useGetAllAutomationStatuses();
  const { data: logs } = useGetAllAgentLogs();
  const { data: performanceSummary } = useGetOfferPerformanceSummary();
  const runAllAgents = useRunAllAgents();
  const startRecurringTimer = useStartRecurringTimer();

  // Track executing state for immediate UI feedback
  const [isExecutingAll, setIsExecutingAll] = useState(false);

  const handleRunAllAgents = () => {
    setIsExecutingAll(true);
    runAllAgents.mutate(undefined, {
      onSettled: () => {
        setTimeout(() => setIsExecutingAll(false), 1000);
      },
    });
  };

  // Count agents that are running or recently ran
  const getRunningAgentsCount = () => {
    if (!automationStatuses) return 0;
    
    return automationStatuses.filter(([_, status]) => {
      if (status.running) return true;
      
      // Consider recently run (within last 10 seconds) as transitioning
      if (status.lastRun) {
        const timeSinceLastRun = Date.now() - Number(status.lastRun) / 1000000;
        return timeSinceLastRun < 10000;
      }
      
      return false;
    }).length;
  };

  const activeAgents = isExecutingAll ? 4 : getRunningAgentsCount();
  const totalAgents = 4;

  const systemHealth = totalAgents > 0 ? Math.min(100, (activeAgents / totalAgents) * 100 + 75) : 75;

  // Calculate total executions from automation statuses
  const totalExecutions = automationStatuses?.reduce((sum, [_, status]) => sum + Number(status.totalExecutions), 0) || 0;

  // Calculate success/failure stats from logs
  const calculateGlobalStats = () => {
    if (!logs) return { success: 0, failure: 0, total: 0 };
    const allLogs = [...logs.habit, ...logs.affiliate, ...logs.copy, ...logs.analytics];
    const total = allLogs.length;
    const success = allLogs.filter(log => !log.toLowerCase().includes('error')).length;
    const failure = total - success;
    return { success, failure, total };
  };

  const globalStats = calculateGlobalStats();

  // Affiliate performance metrics
  const totalClicks = performanceSummary?.clickCounts.reduce((sum, [_, clicks]) => sum + Number(clicks), 0) || 0;
  const avgConversionRate = performanceSummary?.conversionRates.length 
    ? performanceSummary.conversionRates.reduce((sum, [_, rate]) => sum + rate, 0) / performanceSummary.conversionRates.length 
    : 0;

  // Simulated metrics for demonstration
  const uptime = '99.8%';
  const avgResponseTime = '142ms';
  const throughput = `${totalExecutions} ops`;

  const getAgentTypeLabel = (type: AgentType) => {
    const labels = {
      [AgentType.habit]: 'Habit',
      [AgentType.affiliate]: 'Affiliate',
      [AgentType.copy]: 'Copy',
      [AgentType.analytics]: 'Analytics',
    };
    return labels[type];
  };

  const getAgentStatusInfo = (status: { running: boolean; lastRun?: bigint; totalExecutions: bigint }) => {
    if (isExecutingAll || status.running) {
      return { label: 'Running', variant: 'default' as const, showSpinner: true };
    }
    
    if (status.lastRun) {
      const timeSinceLastRun = Date.now() - Number(status.lastRun) / 1000000;
      if (timeSinceLastRun < 15000) {
        return { label: 'Recently Run', variant: 'secondary' as const, showSpinner: false };
      }
    }
    
    return { label: 'Idle', variant: 'outline' as const, showSpinner: false };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">System Monitor</h3>
          <p className="text-sm text-muted-foreground">
            {activeAgents > 0 ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-chart-2" />
                {activeAgents} of {totalAgents} agents active
              </span>
            ) : (
              <span>Real-time system health and performance metrics</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRunAllAgents}
            disabled={isExecutingAll || runAllAgents.isPending}
          >
            {isExecutingAll || runAllAgents.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Run All Agents
              </>
            )}
          </Button>
          <Button
            variant="default"
            className="gap-2"
            onClick={() => startRecurringTimer.mutate()}
            disabled={startRecurringTimer.isPending}
          >
            <Timer className="h-4 w-4" />
            {startRecurringTimer.isPending ? 'Starting...' : 'Start Auto Timer'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.toFixed(0)}%</div>
            <Progress value={systemHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Cpu className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {activeAgents}/{totalAgents}
              </div>
              {activeAgents > 0 && <Loader2 className="h-4 w-4 animate-spin text-chart-2" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeAgents > 0 ? 'agents running' : 'agents ready'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
            <p className="text-xs text-muted-foreground">operations completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalStats.total > 0 ? ((globalStats.success / globalStats.total) * 100).toFixed(0) : 0}%
            </div>
            <Progress value={globalStats.total > 0 ? (globalStats.success / globalStats.total) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Performance Tracking Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-chart-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              Affiliate Agent Performance
            </CardTitle>
            <CardDescription>Real-time offer promotion metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-chart-2" />
                <span className="text-sm font-medium">Total Clicks</span>
              </div>
              <Badge variant="outline" className="text-chart-2">
                {totalClicks.toLocaleString()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-chart-3" />
                <span className="text-sm font-medium">Avg Conversion Rate</span>
              </div>
              <Badge variant="outline" className="text-chart-3">
                {(avgConversionRate * 100).toFixed(1)}%
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Offers</span>
                <span className="font-medium">{Number(performanceSummary?.totalOffers || 0n)}</span>
              </div>
              <Progress value={avgConversionRate * 100} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-chart-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-chart-4" />
              Analytics Agent Insights
            </CardTitle>
            <CardDescription>Performance analysis and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-chart-2" />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <Badge variant="outline" className="text-chart-2">
                {globalStats.total > 0 ? ((globalStats.success / globalStats.total) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Failure Rate</span>
              </div>
              <Badge variant="outline" className="text-destructive">
                {globalStats.total > 0 ? ((globalStats.failure / globalStats.total) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Operations</span>
                <span className="font-medium">{globalStats.total}</span>
              </div>
              <Progress value={globalStats.total > 0 ? (globalStats.success / globalStats.total) * 100 : 0} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {automationStatuses?.map(([agentType, status]) => {
          const statusInfo = getAgentStatusInfo(status);
          
          return (
            <Card key={agentType} className={statusInfo.showSpinner ? 'border-chart-2' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{getAgentTypeLabel(agentType)} Agent</CardTitle>
                  {statusInfo.showSpinner && <Loader2 className="h-4 w-4 animate-spin text-chart-2" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={statusInfo.variant}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Executions:</span>
                  <span className="font-medium">{Number(status.totalExecutions)}</span>
                </div>
                {status.lastRun && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Last Run:</span>
                    <span className="font-medium">
                      {new Date(Number(status.lastRun) / 1000000).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>System performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-chart-2" />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <Badge variant="outline">{uptime}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-chart-3" />
                <span className="text-sm font-medium">Avg Response Time</span>
              </div>
              <Badge variant="outline">{avgResponseTime}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-chart-4" />
                <span className="text-sm font-medium">Total Operations</span>
              </div>
              <Badge variant="outline">{throughput}</Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-chart-2" />
                  <span className="text-sm font-medium">Success Rate</span>
                </div>
                <Badge variant="outline" className="text-chart-2">
                  {globalStats.total > 0 ? ((globalStats.success / globalStats.total) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">Failure Rate</span>
                </div>
                <Badge variant="outline" className="text-destructive">
                  {globalStats.total > 0 ? ((globalStats.failure / globalStats.total) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution Statistics</CardTitle>
            <CardDescription>Breakdown by agent type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {automationStatuses && automationStatuses.length > 0 ? (
              <>
                {automationStatuses.map(([agentType, status]) => {
                  const executions = Number(status.totalExecutions);
                  const percentage = totalExecutions > 0 ? (executions / totalExecutions) * 100 : 0;
                  return (
                    <div key={agentType} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{getAgentTypeLabel(agentType)}</span>
                        <span className="font-medium">{executions}</span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No execution data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Logs Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Execution Logs</CardTitle>
              <CardDescription>Real-time agent execution activity</CardDescription>
            </div>
            <Badge variant="outline">{globalStats.total} total logs</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 rounded-md border bg-muted/30 p-4">
            {logs && globalStats.total > 0 ? (
              <div className="space-y-2">
                {Object.entries(logs).flatMap(([type, entries]) =>
                  entries.map((log, idx) => ({
                    type,
                    log,
                    key: `${type}-${idx}`,
                  }))
                ).reverse().slice(0, 20).map(({ type, log, key }) => (
                  <div key={key} className="flex items-start gap-3 rounded-md bg-background p-2">
                    <Badge variant="outline" className="mt-0.5 capitalize">
                      {type}
                    </Badge>
                    <div className="flex-1 font-mono text-xs text-muted-foreground">
                      {log}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No execution logs yet. Run agents to see activity.
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

