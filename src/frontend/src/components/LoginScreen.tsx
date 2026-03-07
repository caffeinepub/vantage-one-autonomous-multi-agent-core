import { Button } from "@/components/ui/button";
import { BarChart2, FileText, Lock, TrendingUp, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background grid-bg">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-48 w-64 rounded-full bg-chart-3/8 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-40 w-40 rounded-full bg-chart-2/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm px-6">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-2xl glow-blue animate-float">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-3xl font-black tracking-widest text-glow-blue">
              VANTAGE<span className="text-primary">ONE</span>
            </h1>
            <p className="mt-1 font-mono text-xs tracking-wider text-muted-foreground">
              AI AFFILIATE OPERATING SYSTEM
            </p>
          </div>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl border border-white/8 bg-card/90 p-7 shadow-2xl backdrop-blur-xl"
          style={{ boxShadow: "0 0 40px oklch(0.72 0.19 218 / 0.1)" }}
        >
          <div className="space-y-5">
            <div className="space-y-1 text-center">
              <h2 className="text-lg font-bold">Access Control</h2>
              <p className="text-sm text-muted-foreground">
                Authenticate with Internet Identity to enter
              </p>
            </div>

            <Button
              data-ocid="login.primary_button"
              onClick={login}
              disabled={isLoggingIn}
              size="lg"
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isLoggingIn ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            {/* Feature previews */}
            <div className="space-y-2.5 pt-1 border-t border-border">
              {[
                {
                  icon: TrendingUp,
                  label: "Affiliate Agent",
                  desc: "Discover high-converting offers automatically",
                  color: "text-chart-2",
                },
                {
                  icon: FileText,
                  label: "Copy Agent",
                  desc: "Generate landing pages and sales funnels",
                  color: "text-primary",
                },
                {
                  icon: BarChart2,
                  label: "Analytics Agent",
                  desc: "Adaptive learning from real performance data",
                  color: "text-chart-4",
                },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className="flex items-start gap-3 pt-2.5">
                  <div className="mt-0.5 h-7 w-7 shrink-0 flex items-center justify-center rounded-lg bg-muted/50">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] font-mono text-muted-foreground/50">
          Secured by Internet Computer · Decentralized Identity
        </p>
      </div>
    </div>
  );
}
