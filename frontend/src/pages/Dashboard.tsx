import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentsDashboard from '../components/AgentsDashboard';
import SystemMonitor from '../components/SystemMonitor';
import CollectiveIntelligence from '../components/CollectiveIntelligence';
import AdminDashboard from '../components/AdminDashboard';
import NetworkVisualization from '../components/NetworkVisualization';
import { Activity, BarChart3, Brain, Settings, Network } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllAutomationStatuses, useGetCollaborationStats } from '../hooks/useQueries';

export default function Dashboard() {
  const { data: automationStatuses } = useGetAllAutomationStatuses();
  const { data: collaborationStats } = useGetCollaborationStats();

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
            Vantage One AI Operating System
          </h2>
          <p className="text-muted-foreground">
            Living AI ecosystem with autonomous agents and collective intelligence
          </p>
        </div>

        {/* Network Visualization Hero Section */}
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-muted/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <CardTitle>AI Ecosystem Network</CardTitle>
            </div>
            <CardDescription>
              Real-time visualization of agent collaboration and knowledge flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <NetworkVisualization 
                automationStatuses={automationStatuses}
                collaborationStats={collaborationStats}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="agents" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Agents</span>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Intelligence</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <AgentsDashboard />
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <CollectiveIntelligence />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemMonitor />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <AdminDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
