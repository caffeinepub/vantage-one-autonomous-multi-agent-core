import { useEffect, useRef, useState } from 'react';
import { AgentType, AutomationStatus } from '../backend';
import { Brain, TrendingUp, FileText, BarChart } from 'lucide-react';

interface NetworkVisualizationProps {
  automationStatuses?: Array<[AgentType, AutomationStatus]>;
  collaborationStats?: Array<[AgentType, bigint]>;
}

interface AgentNode {
  id: AgentType;
  x: number;
  y: number;
  label: string;
  icon: typeof Brain;
  color: string;
  glowColor: string;
  isActive: boolean;
  pulseIntensity: number;
}

export default function NetworkVisualization({ automationStatuses, collaborationStats }: NetworkVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [dataFlows, setDataFlows] = useState<Array<{ from: number; to: number; progress: number; intensity: number }>>([]);

  const agentConfig = {
    [AgentType.habit]: {
      label: 'Habit',
      icon: Brain,
      color: '#8b5cf6',
      glowColor: 'rgba(139, 92, 246, 0.6)',
    },
    [AgentType.affiliate]: {
      label: 'Affiliate',
      icon: TrendingUp,
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.6)',
    },
    [AgentType.copy]: {
      label: 'Copy',
      icon: FileText,
      color: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.6)',
    },
    [AgentType.analytics]: {
      label: 'Analytics',
      icon: BarChart,
      color: '#ec4899',
      glowColor: 'rgba(236, 72, 153, 0.6)',
    },
  };

  const agentTypes = [AgentType.habit, AgentType.affiliate, AgentType.copy, AgentType.analytics];

  // Create agent nodes in a circular layout
  const createNodes = (width: number, height: number): AgentNode[] => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    return agentTypes.map((type, index) => {
      const angle = (index * Math.PI * 2) / agentTypes.length - Math.PI / 2;
      const config = agentConfig[type];
      const status = automationStatuses?.find(([t]) => t === type)?.[1];
      const isActive = status?.running || false;
      const collaborations = collaborationStats?.find(([t]) => t === type)?.[1];
      const pulseIntensity = collaborations ? Math.min(Number(collaborations) / 10, 1) : 0;

      return {
        id: type,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        label: config.label,
        icon: config.icon,
        color: config.color,
        glowColor: config.glowColor,
        isActive,
        pulseIntensity,
      };
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    // Generate data flows based on active agents
    const activeAgents = automationStatuses?.filter(([_, status]) => status.running).map(([type]) => type) || [];
    
    if (activeAgents.length > 0) {
      const interval = setInterval(() => {
        setDataFlows(prev => {
          // Update existing flows
          const updated = prev.map(flow => ({
            ...flow,
            progress: flow.progress + 0.02,
          })).filter(flow => flow.progress < 1);

          // Add new flows randomly
          if (Math.random() > 0.7 && updated.length < 8) {
            const fromIdx = Math.floor(Math.random() * agentTypes.length);
            const toIdx = (fromIdx + 1) % agentTypes.length;
            const intensity = Math.random() * 0.5 + 0.5;
            updated.push({ from: fromIdx, to: toIdx, progress: 0, intensity });
          }

          return updated;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [automationStatuses]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const nodes = createNodes(rect.width, rect.height);

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw connection lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      nodes.forEach((node, i) => {
        const nextNode = nodes[(i + 1) % nodes.length];
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(nextNode.x, nextNode.y);
        ctx.stroke();
      });

      // Draw data flows
      dataFlows.forEach(flow => {
        const fromNode = nodes[flow.from];
        const toNode = nodes[flow.to];
        const x = fromNode.x + (toNode.x - fromNode.x) * flow.progress;
        const y = fromNode.y + (toNode.y - fromNode.y) * flow.progress;

        // Glowing line
        const gradient = ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
        gradient.addColorStop(flow.progress, `rgba(139, 92, 246, ${flow.intensity})`);
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Glowing particle
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        particleGradient.addColorStop(0, `rgba(139, 92, 246, ${flow.intensity})`);
        particleGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach((node, index) => {
        const pulsePhase = (animationFrame + index * 30) % 120;
        const pulse = Math.sin((pulsePhase / 120) * Math.PI * 2) * 0.3 + 0.7;
        const nodeRadius = node.isActive ? 35 + pulse * 10 : 30;

        // Outer glow
        if (node.isActive || node.pulseIntensity > 0) {
          const glowRadius = nodeRadius + 15 + pulse * 5;
          const glowGradient = ctx.createRadialGradient(node.x, node.y, nodeRadius, node.x, node.y, glowRadius);
          glowGradient.addColorStop(0, node.glowColor);
          glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node circle
        const nodeGradient = ctx.createRadialGradient(
          node.x - nodeRadius * 0.3,
          node.y - nodeRadius * 0.3,
          0,
          node.x,
          node.y,
          nodeRadius
        );
        nodeGradient.addColorStop(0, node.color);
        nodeGradient.addColorStop(1, node.color + 'cc');
        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node border
        ctx.strokeStyle = node.isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = node.isActive ? 3 : 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Status indicator
        if (node.isActive) {
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(node.x + nodeRadius * 0.6, node.y - nodeRadius * 0.6, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y + nodeRadius + 20);

        // Collaboration count
        if (node.pulseIntensity > 0) {
          const collabCount = collaborationStats?.find(([t]) => t === node.id)?.[1];
          if (collabCount) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '12px system-ui';
            ctx.fillText(String(collabCount), node.x, node.y + nodeRadius + 35);
          }
        }
      });

      setAnimationFrame(prev => (prev + 1) % 120);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [animationFrame, automationStatuses, collaborationStats, dataFlows]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-br from-background via-muted/20 to-background">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-xs backdrop-blur-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-muted-foreground">Neural network active</span>
        </div>
      </div>
    </div>
  );
}
