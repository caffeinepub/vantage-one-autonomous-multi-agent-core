import { useCallback, useEffect, useRef } from "react";
import { AgentType, type AutomationStatus } from "../backend";

interface NetworkVisualizationProps {
  automationStatuses?: Array<[AgentType, AutomationStatus]>;
  collaborationStats?: Array<[AgentType, bigint]>;
}

interface Particle {
  from: number;
  to: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

const AGENT_COLORS = {
  [AgentType.affiliate]: {
    primary: "#00e5a0",
    glow: "rgba(0,229,160,0.7)",
    label: "Affiliate",
  },
  [AgentType.habit]: {
    primary: "#7c5cfc",
    glow: "rgba(124,92,252,0.7)",
    label: "Funnel",
  },
  [AgentType.copy]: {
    primary: "#00b4ff",
    glow: "rgba(0,180,255,0.7)",
    label: "Copy",
  },
  [AgentType.analytics]: {
    primary: "#ff6ddb",
    glow: "rgba(255,109,219,0.7)",
    label: "Analytics",
  },
};

const AGENT_ORDER = [
  AgentType.affiliate,
  AgentType.copy,
  AgentType.analytics,
  AgentType.habit,
];

export default function NetworkVisualization({
  automationStatuses,
  collaborationStats,
}: NetworkVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const tickRef = useRef(0);

  const getCollabCount = useCallback(
    (agent: AgentType) => {
      const c = collaborationStats?.find(([t]) => t === agent)?.[1];
      return c ? Number(c) : 0;
    },
    [collaborationStats],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawFrame = () => {
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const cx = W / 2;
      const cy = H / 2;
      const r = Math.min(W, H) * 0.33;

      ctx.clearRect(0, 0, W, H);

      // Background grid dots
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      for (let x = 0; x < W; x += 32) {
        for (let y = 0; y < H; y += 32) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const nodes = AGENT_ORDER.map((type, i) => {
        const angle = (i * Math.PI * 2) / AGENT_ORDER.length - Math.PI / 2;
        const status = automationStatuses?.find(([t]) => t === type)?.[1];
        const isActive = status?.running ?? false;
        const collabs = getCollabCount(type);
        return {
          type,
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
          isActive,
          collabs,
          cfg: AGENT_COLORS[type],
        };
      });

      // Draw base connections between all node pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(255,255,255,0.04)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw active connection glow lines
      const activeNodes = nodes.filter((n) => n.isActive);
      if (activeNodes.length >= 2) {
        for (let i = 0; i < activeNodes.length; i++) {
          for (let j = i + 1; j < activeNodes.length; j++) {
            const a = activeNodes[i];
            const b = activeNodes[j];
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, a.cfg.glow.replace("0.7", "0.25"));
            grad.addColorStop(0.5, "rgba(100,180,255,0.15)");
            grad.addColorStop(1, b.cfg.glow.replace("0.7", "0.25"));
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particlesRef.current = particlesRef.current
        .map((p) => ({ ...p, progress: p.progress + p.speed }))
        .filter((p) => p.progress < 1);

      for (const p of particlesRef.current) {
        const from = nodes[p.from];
        const to = nodes[p.to];
        if (!from || !to) return;
        const x = from.x + (to.x - from.x) * p.progress;
        const y = from.y + (to.y - from.y) * p.progress;

        // Trail
        const trailLen = 0.08;
        const t0 = Math.max(0, p.progress - trailLen);
        const tx = from.x + (to.x - from.x) * t0;
        const ty = from.y + (to.y - from.y) * t0;
        const lineGrad = ctx.createLinearGradient(tx, ty, x, y);
        lineGrad.addColorStop(0, p.color.replace(/[\d.]+\)$/, "0)"));
        lineGrad.addColorStop(1, p.color);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = p.size;
        ctx.stroke();

        // Particle glow
        const pg = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4);
        pg.addColorStop(0, p.color);
        pg.addColorStop(1, p.color.replace(/[\d.]+\)$/, "0)"));
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spawn particles on active connections
      tickRef.current++;
      if (tickRef.current % 6 === 0) {
        const activeIdxs = nodes
          .map((n, i) => (n.isActive ? i : -1))
          .filter((i) => i >= 0);
        if (activeIdxs.length >= 1) {
          const from =
            activeIdxs[Math.floor(Math.random() * activeIdxs.length)];
          const to =
            (from + 1 + Math.floor(Math.random() * (nodes.length - 1))) %
            nodes.length;
          const fromNode = nodes[from];
          particlesRef.current.push({
            from,
            to,
            progress: 0,
            speed: 0.012 + Math.random() * 0.008,
            color: fromNode.cfg.glow,
            size: 1.5 + Math.random() * 1.5,
          });
        }
      }
      // Also spawn ambient particles occasionally
      if (tickRef.current % 18 === 0 && particlesRef.current.length < 12) {
        const from = Math.floor(Math.random() * nodes.length);
        const to =
          (from + 1 + Math.floor(Math.random() * (nodes.length - 1))) %
          nodes.length;
        particlesRef.current.push({
          from,
          to,
          progress: 0,
          speed: 0.008 + Math.random() * 0.005,
          color: "rgba(100,150,255,0.4)",
          size: 1,
        });
      }

      // Draw center hub
      const hubPulse = 0.6 + 0.4 * Math.sin(tickRef.current * 0.05);
      const hubR = 18;
      const hubGrad = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        hubR * 2.5 * hubPulse,
      );
      hubGrad.addColorStop(0, "rgba(0,180,255,0.25)");
      hubGrad.addColorStop(1, "transparent");
      ctx.fillStyle = hubGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, hubR * 2.5 * hubPulse, 0, Math.PI * 2);
      ctx.fill();

      const hubCore = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubR);
      hubCore.addColorStop(0, "rgba(100,200,255,0.9)");
      hubCore.addColorStop(0.5, "rgba(50,100,255,0.7)");
      hubCore.addColorStop(1, "rgba(20,60,200,0.4)");
      ctx.fillStyle = hubCore;
      ctx.beginPath();
      ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(100,200,255,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw spoke lines to center
      for (const node of nodes) {
        if (node.isActive) {
          const grad = ctx.createLinearGradient(cx, cy, node.x, node.y);
          grad.addColorStop(0, "rgba(0,180,255,0.2)");
          grad.addColorStop(1, node.cfg.glow.replace("0.7", "0.1"));
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(node.x, node.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw nodes
      nodes.forEach((node, idx) => {
        const t = tickRef.current;
        const pulse = 0.8 + 0.2 * Math.sin(t * 0.06 + idx * 1.2);
        const baseR = node.isActive ? 26 : 22;
        const nodeR = baseR + (node.isActive ? pulse * 5 : 0);

        // Outer glow
        const glowR = nodeR + (node.isActive ? 22 : 10);
        const glow = ctx.createRadialGradient(
          node.x,
          node.y,
          nodeR * 0.5,
          node.x,
          node.y,
          glowR,
        );
        glow.addColorStop(
          0,
          node.cfg.glow.replace("0.7", node.isActive ? "0.4" : "0.12"),
        );
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Node fill
        const nodeFill = ctx.createRadialGradient(
          node.x - nodeR * 0.3,
          node.y - nodeR * 0.3,
          0,
          node.x,
          node.y,
          nodeR,
        );
        nodeFill.addColorStop(0, `${node.cfg.primary}ff`);
        nodeFill.addColorStop(0.6, `${node.cfg.primary}cc`);
        nodeFill.addColorStop(1, `${node.cfg.primary}66`);
        ctx.fillStyle = nodeFill;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = node.isActive
          ? node.cfg.primary
          : "rgba(255,255,255,0.2)";
        ctx.lineWidth = node.isActive ? 2 : 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);
        ctx.stroke();

        // Active pulse ring
        if (node.isActive) {
          const ringR = nodeR + 8 + pulse * 6;
          ctx.strokeStyle = node.cfg.glow.replace("0.7", String(0.4 * pulse));
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Active dot
        if (node.isActive) {
          ctx.fillStyle = "#00ff88";
          ctx.beginPath();
          ctx.arc(
            node.x + nodeR * 0.6,
            node.y - nodeR * 0.6,
            4,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.5)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = node.isActive
          ? "rgba(255,255,255,0.95)"
          : "rgba(255,255,255,0.65)";
        ctx.font = `${node.isActive ? "bold" : "normal"} 12px "Geist Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(node.cfg.label.toUpperCase(), node.x, node.y + nodeR + 8);

        // Collab count
        if (node.collabs > 0) {
          ctx.fillStyle = node.cfg.glow.replace("0.7", "0.8");
          ctx.font = '10px "Geist Mono", monospace';
          ctx.fillText(`${node.collabs}`, node.x, node.y + nodeR + 22);
        }
      });

      frameRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();
    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, [automationStatuses, getCollabCount]);

  const activeCount =
    automationStatuses?.filter(([, s]) => s.running).length ?? 0;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
      {/* Bottom status bar */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs backdrop-blur-md">
          <span
            className={`h-2 w-2 rounded-full ${activeCount > 0 ? "bg-chart-2 animate-pulse" : "bg-muted-foreground/50"}`}
          />
          <span className="text-muted-foreground font-mono">
            {activeCount > 0
              ? `${activeCount} agents active · neural sync`
              : "network idle · standing by"}
          </span>
        </div>
      </div>
    </div>
  );
}
