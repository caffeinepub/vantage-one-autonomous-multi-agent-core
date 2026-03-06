import { useGetAllAgentLogs, useGetAllAutomationStatuses, useRunAgent, useRunAllAgents, useGetOfferPerformanceSummary } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AgentType } from '../backend';
import { Brain, TrendingUp, FileText, BarChart, Play, PlayCircle, CheckCircle, XCircle, Clock, Loader2, Zap, MousePointerClick, Target } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

const agentTypeConfig = {
  [AgentType.habit]: {
    label: 'Habit Agent',
    icon: Brain,
    color: 'from-chart-1 to-chart-2',
    description: 'Monitors and reinforces user habits',
    bgGlow: 'bg-chart-1/10',
  },
  [AgentType.affiliate]: {
    label: 'Affiliate Agent',
    icon: TrendingUp,
    color: 'from-chart-2 to-chart-3',
    description: 'Manages affiliate marketing campaigns',
    bgGlow: 'bg-chart-2/10',
  },
  [AgentType.copy]: {
    label: 'Copy Agent',
    icon: FileText,
    color: 'from-chart-3 to-chart-4',
    description: 'Generates and optimizes content',
    bgGlow: 'bg-chart-3/10',
  },
  [AgentType.analytics]: {
    label: 'Analytics Agent',
    icon: BarChart,
    color: 'from-chart-4 to-chart-5',
    description: 'Analyzes data and generates insights',
    bgGlow: 'bg-chart-4/10',
  },
};

const allAgentTypes = [AgentType.habit, AgentType.affiliate, AgentType.copy, AgentType.analytics];

export default function AgentsDashboard() {
  const { data: logs, isLoading: logsLoading } = useGetAllAgentLogs();
  const { data: automationStatuses, isLoading: statusesLoading } = useGetAllAutomationStatuses();
  const { data: performanceSummary } = useGetOfferPerformanceSummary();
  const runAgent = useRunAgent();
  const runAllAgents = useRunAllAgents();

  const [executingAgents, setExecutingAgents] = useState<Set<AgentType>>(new Set());
  const [thinkingProgress, setThinkingProgress] = useState<Record<AgentType, number>>({} as Record<AgentType, number>);

  const isLoading = logsLoading || statusesLoading;

  // Simulate thinking progress for active agents
  useEffect(() => {
    const interval = setInterval(() => {
      setThinkingProgress(prev => {
        const next = { ...prev };
        executingAgents.forEach(agent => {
          next[agent] = ((prev[agent] || 0) + Math.random() * 15) % 100;
        });
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [executingAgents]);

  const handleRunAgent = (agentType: AgentType) => {
    setExecutingAgents(prev => new Set(prev).add(agentType));
    setThinkingProgress(prev => ({ ...prev, [agentType]: 0 }));
    runAgent.mutate(agentType, {
      onSettled: () => {
        setTimeout(() => {
          setExecutingAgents(prev => {
            const next = new Set(prev);
            next.delete(agentType);
            return next;
          });
          setThinkingProgress(prev => {
            const next = { ...prev };
            delete next[agentType];
            return next;
          });
        }, 1000);
      },
    });
  };

  const handleRunAllAgents = () => {
    allAgentTypes.forEach(type => {
      setExecutingAgents(prev => new Set(prev).add(type));
      setThinkingProgress(prev => ({ ...prev, [type]: 0 }));
    });
    runAllAgents.mutate(undefined, {
      onSettled: () => {
        setTimeout(() => {
          setExecutingAgents(new Set());
          setThinkingProgress({} as Record<AgentType, number>);
        }, 1000);
      },
    });
  };

  const getAutomationStatus = (agentType: AgentType) => {
    if (!automationStatuses) return null;
    const status = automationStatuses.find(([type]) => type === agentType);
    return status ? status[1] : null;
  };

  const getAgentLogs = (agentType: AgentType) => {
    if (!logs) return [];
    return logs[agentType] || [];
  };

  const calculateStats = (agentType: AgentType) => {
    const agentLogs = getAgentLogs(agentType);
    const totalRuns = agentLogs.length;
    const successRuns = agentLogs.filter(log => !log.toLowerCase().includes('error')).length;
    const failureRuns = totalRuns - successRuns;
    return { totalRuns, successRuns, failureRuns };
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const getAgentStatus = (agentType: AgentType) => {
    const isExecuting = executingAgents.has(agentType);
    const status = getAutomationStatus(agentType);
    
    if (isExecuting) {
      return { label: 'Thinking', variant: 'default' as const, color: 'text-chart-2', showPulse: true };
    }
    
    if (status?.running) {
      return { label: 'Running', variant: 'default' as const, color: 'text-chart-2', showPulse: true };
    }
    
    if (status?.lastRun) {
      const timeSinceLastRun = Date.now() - Number(status.lastRun) / 1000000;
      if (timeSinceLastRun < 15000) {
        return { label: 'Learning', variant: 'secondary' as const, color: 'text-chart-3', showPulse: false };
      }
    }
    
    return { label: 'Idle', variant: 'outline' as const, color: 'text-muted-foreground', showPulse: false };
  };

  // Get affiliate-specific metrics
  const getAffiliateMetrics = () => {
    const totalClicks = performanceSummary?.clickCounts.reduce((sum, [_, clicks]) => sum + Number(clicks), 0) || 0;
    const avgConversionRate = performanceSummary?.conversionRates.length 
      ? performanceSummary.conversionRates.reduce((sum, [_, rate]) => sum + rate, 0) / performanceSummary.conversionRates.length 
      : 0;
    return { totalClicks, avgConversionRate };
  };

  const affiliateMetrics = getAffiliateMetrics();

  // Get analytics-specific metrics
  const getAnalyticsMetrics = () => {
    if (!logs) return { totalAnalyses: 0, successRate: 0 };
    const analyticsLogs = logs.analytics || [];
    const totalAnalyses = analyticsLogs.length;
    const successfulAnalyses = analyticsLogs.filter(log => !log.toLowerCase().includes('error')).length;
    const successRate = totalAnalyses > 0 ? (successfulAnalyses / totalAnalyses) * 100 : 0;
    return { totalAnalyses, successRate };
  };

  const analyticsMetrics = getAnalyticsMetrics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const runningAgents = allAgentTypes.filter(type => {
    const isExecuting = executingAgents.has(type);
    const status = getAutomationStatus(type);
    return isExecuting || status?.running;
  }).length;

  const totalAgents = allAgentTypes.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">Agent Monitoring Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            {runningAgents > 0 ? (
              <span className="flex items-center gap-2">
                <Zap className="h-3 w-3 animate-pulse text-chart-2" />
                {runningAgents} of {totalAgents} agents actively thinking
              </span>
            ) : (
              <span>{totalAgents} agents ready</span>
            )}
          </p>
        </div>
        <Button 
          variant="default" 
          className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90"
          onClick={handleRunAllAgents}
          disabled={runAllAgents.isPending}
        >
          <PlayCircle className="h-4 w-4" />
          {runAllAgents.isPending ? 'Activating...' : 'Activate All Agents'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {allAgentTypes.map((agentType) => {
          const config = agentTypeConfig[agentType];
          const Icon = config.icon;
          const status = getAutomationStatus(agentType);
          const stats = calculateStats(agentType);
          const agentLogs = getAgentLogs(agentType);
          const agentStatus = getAgentStatus(agentType);
          const isExecuting = executingAgents.has(agentType);
          const progress = thinkingProgress[agentType] || 0;
          
          // Show affiliate-specific metrics for Affiliate Agent
          const showAffiliateMetrics = agentType === AgentType.affiliate;
          const showAnalyticsMetrics = agentType === AgentType.analytics;
          
          return (
            <Card 
              key={agentType} 
              className={`overflow-hidden transition-all duration-500 ${
                isExecuting ? `${config.bgGlow} shadow-lg ring-2 ring-primary/30` : ''
              }`}
            >
              <div className={`h-2 bg-gradient-to-r ${config.color} ${isExecuting ? 'animate-pulse' : ''}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config.color} ${isExecuting ? 'animate-pulse' : ''} shadow-lg`}>
                      {isExecuting ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      ) : (
                        <Icon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{config.label}</CardTitle>
                      <CardDescription className="text-xs">
                        {config.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={agentStatus.variant} className={`${agentStatus.color} ${agentStatus.showPulse ? 'animate-pulse' : ''}`}>
                    {agentStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Thinking Progress */}
                {isExecuting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Processing...</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Agent-Specific Performance Metrics */}
                {showAffiliateMetrics && (
                  <div className="space-y-2 rounded-lg bg-chart-2/10 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Performance Metrics</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MousePointerClick className="h-3 w-3" />
                          Clicks
                        </div>
                        <p className="text-sm font-bold">{affiliateMetrics.totalClicks.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="h-3 w-3" />
                          Conv Rate
                        </div>
                        <p className="text-sm font-bold">{(affiliateMetrics.avgConversionRate * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {showAnalyticsMetrics && (
                  <div className="space-y-2 rounded-lg bg-chart-4/10 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Analytics Insights</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BarChart className="h-3 w-3" />
                          Analyses
                        </div>
                        <p className="text-sm font-bold">{analyticsMetrics.totalAnalyses}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3" />
                          Success
                        </div>
                        <p className="text-sm font-bold">{analyticsMetrics.successRate.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Play className="h-3 w-3" />
                      Runs
                    </div>
                    <div className="text-lg font-bold">{stats.totalRuns}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-chart-2">
                      <CheckCircle className="h-3 w-3" />
                      Success
                    </div>
                    <div className="text-lg font-bold text-chart-2">{stats.successRuns}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-destructive">
                      <XCircle className="h-3 w-3" />
                      Failed
                    </div>
                    <div className="text-lg font-bold text-destructive">{stats.failureRuns}</div>
                  </div>
                </div>

                {/* Last Run Info */}
                {status?.lastRun && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Run:</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium text-xs">
                          {formatTimestamp(status.lastRun)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Executions:</span>
                      <span className="font-medium">{Number(status.totalExecutions)}</span>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Live Logs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Live Logs</span>
                    <Badge variant="outline" className="text-xs">
                      {agentLogs.length} entries
                    </Badge>
                  </div>
                  <ScrollArea className="h-24 rounded-md border bg-muted/30 p-2">
                    {agentLogs.length > 0 ? (
                      <div className="space-y-1">
                        {agentLogs.slice(-5).reverse().map((log, idx) => (
                          <div key={idx} className="text-xs font-mono text-muted-foreground animate-in fade-in slide-in-from-top-2">
                            {log}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No logs yet
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Control Button */}
                <Button
                  variant="default"
                  size="sm"
                  className={`w-full gap-2 transition-all duration-300 ${
                    isExecuting ? 'bg-gradient-to-r from-chart-2 to-chart-3' : ''
                  }`}
                  onClick={() => handleRunAgent(agentType)}
                  disabled={isExecuting || runAgent.isPending}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Activate
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

