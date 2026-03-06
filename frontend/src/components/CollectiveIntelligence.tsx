import { useGetCallerKnowledgeEntries, useGetCollaborationStats, useRunCollaborationLoop } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AgentType, ContentType } from '../backend';
import { Brain, Lightbulb, TrendingUp, FileText, BarChart, Network, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

const agentTypeConfig = {
  [AgentType.habit]: {
    label: 'Habit Agent',
    icon: Brain,
    color: 'from-chart-1 to-chart-2',
    bgColor: 'bg-chart-1/10',
    textColor: 'text-chart-1',
    flowColor: 'oklch(var(--chart-1))',
  },
  [AgentType.affiliate]: {
    label: 'Affiliate Agent',
    icon: TrendingUp,
    color: 'from-chart-2 to-chart-3',
    bgColor: 'bg-chart-2/10',
    textColor: 'text-chart-2',
    flowColor: 'oklch(var(--chart-2))',
  },
  [AgentType.copy]: {
    label: 'Copy Agent',
    icon: FileText,
    color: 'from-chart-3 to-chart-4',
    bgColor: 'bg-chart-3/10',
    textColor: 'text-chart-3',
    flowColor: 'oklch(var(--chart-3))',
  },
  [AgentType.analytics]: {
    label: 'Analytics Agent',
    icon: BarChart,
    color: 'from-chart-4 to-chart-5',
    bgColor: 'bg-chart-4/10',
    textColor: 'text-chart-4',
    flowColor: 'oklch(var(--chart-4))',
  },
};

const contentTypeConfig = {
  [ContentType.insight]: {
    label: 'Insight',
    icon: Lightbulb,
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  },
  [ContentType.performanceData]: {
    label: 'Performance Data',
    icon: TrendingUp,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  [ContentType.recommendation]: {
    label: 'Recommendation',
    icon: Brain,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  [ContentType.strategy]: {
    label: 'Strategy',
    icon: Network,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
};

// Knowledge Flow Visualization Component
function KnowledgeFlowVisualization({ collaborationStats }: { collaborationStats: Array<[AgentType, bigint]> | undefined }) {
  const [activeFlow, setActiveFlow] = useState<number>(0);
  const agentTypes = [AgentType.habit, AgentType.affiliate, AgentType.copy, AgentType.analytics];

  useEffect(() => {
    if (!collaborationStats || collaborationStats.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % agentTypes.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [collaborationStats]);

  if (!collaborationStats || collaborationStats.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          No collaboration data yet. Run agents to generate insights.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-64 rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10 p-6">
      <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: 'none' }}>
        <defs>
          {agentTypes.map((agentType) => {
            const config = agentTypeConfig[agentType];
            return (
              <linearGradient key={agentType} id={`gradient-${agentType}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={config.flowColor} stopOpacity="0" />
                <stop offset="50%" stopColor={config.flowColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={config.flowColor} stopOpacity="0" />
              </linearGradient>
            );
          })}
        </defs>
        
        {/* Draw connection lines between agents */}
        {agentTypes.map((sourceType, sourceIdx) => {
          const targetIdx = (sourceIdx + 1) % agentTypes.length;
          const sourceX = 20 + (sourceIdx * 25);
          const sourceY = 50;
          const targetX = 20 + (targetIdx * 25);
          const targetY = 50;
          const isActive = activeFlow === sourceIdx;
          
          return (
            <g key={`${sourceType}-flow`}>
              <line
                x1={`${sourceX}%`}
                y1={`${sourceY}%`}
                x2={`${targetX}%`}
                y2={`${sourceY}%`}
                stroke={`url(#gradient-${sourceType})`}
                strokeWidth="3"
                opacity={isActive ? 1 : 0.2}
                className="transition-opacity duration-500"
              />
              {isActive && (
                <circle
                  cx={`${sourceX}%`}
                  cy={`${sourceY}%`}
                  r="4"
                  fill={agentTypeConfig[sourceType].flowColor}
                  className="animate-pulse"
                >
                  <animate
                    attributeName="cx"
                    from={`${sourceX}%`}
                    to={`${targetX}%`}
                    dur="2s"
                    repeatCount="1"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Agent nodes */}
      <div className="relative flex h-full items-center justify-around">
        {agentTypes.map((agentType, idx) => {
          const config = agentTypeConfig[agentType];
          const Icon = config.icon;
          const stat = collaborationStats.find(([type]) => type === agentType);
          const count = stat ? Number(stat[1]) : 0;
          const isActive = activeFlow === idx || activeFlow === (idx - 1 + agentTypes.length) % agentTypes.length;
          
          return (
            <div
              key={agentType}
              className={`relative z-10 flex flex-col items-center gap-2 transition-all duration-500 ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${config.color} shadow-lg transition-shadow duration-500 ${
                  isActive ? 'shadow-2xl ring-4 ring-primary/30' : ''
                }`}
              >
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium">{config.label.split(' ')[0]}</div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {count}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flow indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs backdrop-blur-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-muted-foreground">Knowledge flowing</span>
        </div>
      </div>
    </div>
  );
}

export default function CollectiveIntelligence() {
  const { data: knowledgeEntries, isLoading: entriesLoading } = useGetCallerKnowledgeEntries();
  const { data: collaborationStats, isLoading: statsLoading } = useGetCollaborationStats();
  const runCollaborationLoop = useRunCollaborationLoop();

  const isLoading = entriesLoading || statsLoading;

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const getAgentIcon = (agentType: AgentType) => {
    const config = agentTypeConfig[agentType];
    return config.icon;
  };

  const getContentTypeIcon = (contentType: ContentType) => {
    const config = contentTypeConfig[contentType];
    return config.icon;
  };

  // Group entries by agent type
  const entriesByAgent = knowledgeEntries?.reduce((acc, entry) => {
    if (!acc[entry.sourceAgent]) {
      acc[entry.sourceAgent] = [];
    }
    acc[entry.sourceAgent].push(entry);
    return acc;
  }, {} as Record<AgentType, typeof knowledgeEntries>) || {};

  // Find cross-agent references (entries with strategy content type)
  const crossAgentReferences = knowledgeEntries?.filter(
    entry => entry.contentType === ContentType.strategy
  ) || [];

  const totalCollaborations = collaborationStats?.reduce((sum, [_, count]) => sum + Number(count), 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">Collective Intelligence</h3>
          <p className="text-sm text-muted-foreground">
            Shared knowledge core and agent collaboration insights
          </p>
        </div>
        <Button
          variant="default"
          className="gap-2"
          onClick={() => runCollaborationLoop.mutate()}
          disabled={runCollaborationLoop.isPending}
        >
          <RefreshCw className={`h-4 w-4 ${runCollaborationLoop.isPending ? 'animate-spin' : ''}`} />
          {runCollaborationLoop.isPending ? 'Running...' : 'Run Collaboration Loop'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
            <Brain className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeEntries?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total shared insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-Agent References</CardTitle>
            <Network className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crossAgentReferences.length}</div>
            <p className="text-xs text-muted-foreground">Collaborative adaptations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collaborations</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCollaborations}</div>
            <p className="text-xs text-muted-foreground">Agent interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Animated Knowledge Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Collaboration Flow</CardTitle>
          <CardDescription>Live visualization of knowledge exchange between agents</CardDescription>
        </CardHeader>
        <CardContent>
          <KnowledgeFlowVisualization collaborationStats={collaborationStats} />
        </CardContent>
      </Card>

      {/* Collaboration Statistics Grid */}
      {collaborationStats && collaborationStats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {collaborationStats.map(([agentType, count]) => {
            const config = agentTypeConfig[agentType];
            const Icon = config.icon;
            const collaborationCount = Number(count);
            
            return (
              <Card
                key={agentType}
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${config.bgColor}`}
              >
                <div className={`h-1 bg-gradient-to-r ${config.color}`} />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${config.color} shadow-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{config.label}</div>
                      <div className="text-2xl font-bold">{collaborationCount}</div>
                      <div className="text-xs text-muted-foreground">
                        {collaborationCount === 1 ? 'adaptation' : 'adaptations'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cross-Agent References Highlights */}
      {crossAgentReferences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cross-Agent Collaboration Highlights</CardTitle>
            <CardDescription>Examples of agents adapting based on shared knowledge</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {crossAgentReferences.map((entry) => {
                  const config = agentTypeConfig[entry.sourceAgent];
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={entry.id}
                      className="group flex items-start gap-3 rounded-lg border bg-muted/30 p-3 transition-all duration-300 hover:bg-muted/50 hover:shadow-md"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${config.color} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                          <Badge variant="secondary" className="text-xs">
                            Strategy Adaptation
                          </Badge>
                        </div>
                        <p className="text-sm">{entry.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Entries by Agent */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(agentTypeConfig).map(([agentType, config]) => {
          const entries = entriesByAgent[agentType as AgentType] || [];
          const Icon = config.icon;
          
          return (
            <Card key={agentType} className="overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${config.color}`} />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config.color} shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{config.label}</CardTitle>
                    <CardDescription className="text-xs">
                      {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {entries.length > 0 ? (
                    <div className="space-y-2">
                      {entries.map((entry) => {
                        const ContentIcon = getContentTypeIcon(entry.contentType);
                        const contentConfig = contentTypeConfig[entry.contentType];
                        
                        return (
                          <div
                            key={entry.id}
                            className="rounded-lg border bg-background p-3 space-y-2 transition-all duration-300 hover:shadow-md"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs ${contentConfig.color}`}>
                                <ContentIcon className="mr-1 h-3 w-3" />
                                {contentConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm">{entry.content}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(entry.timestamp)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No knowledge entries yet
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All Knowledge Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shared Knowledge Core</CardTitle>
              <CardDescription>All insights, performance data, and recommendations</CardDescription>
            </div>
            <Badge variant="outline">{knowledgeEntries?.length || 0} entries</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {knowledgeEntries && knowledgeEntries.length > 0 ? (
              <div className="space-y-3">
                {knowledgeEntries
                  .sort((a, b) => Number(b.timestamp - a.timestamp))
                  .map((entry) => {
                    const agentConfig = agentTypeConfig[entry.sourceAgent];
                    const contentConfig = contentTypeConfig[entry.contentType];
                    const AgentIcon = agentConfig.icon;
                    const ContentIcon = contentConfig.icon;
                    
                    return (
                      <div
                        key={entry.id}
                        className="group rounded-lg border bg-muted/30 p-4 space-y-3 transition-all duration-300 hover:bg-muted/50 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${agentConfig.color} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                              <AgentIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{agentConfig.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatTimestamp(entry.timestamp)}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={`${contentConfig.color}`}>
                            <ContentIcon className="mr-1 h-3 w-3" />
                            {contentConfig.label}
                          </Badge>
                        </div>
                        <Separator />
                        <p className="text-sm">{entry.content}</p>
                        {entry.references.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Network className="h-3 w-3" />
                            References: {entry.references.length} {entry.references.length === 1 ? 'entry' : 'entries'}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No knowledge entries yet. Run agents to generate shared insights.
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
