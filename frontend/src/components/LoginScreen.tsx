import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Activity, Lock, Shield, Zap } from 'lucide-react';

export default function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container flex flex-1 flex-col items-center justify-center py-12">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-1 to-chart-2 shadow-lg shadow-chart-1/20">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Agent System</h1>
              <p className="text-lg text-muted-foreground">
                Autonomous Management Platform
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-xl">
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold">Welcome</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in with Internet Identity to access your agent dashboard
                </p>
              </div>

              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="w-full bg-gradient-to-r from-chart-1 to-chart-2 text-white shadow-lg shadow-chart-1/20 hover:shadow-xl hover:shadow-chart-1/30"
              >
                {isLoggingIn ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign in with Internet Identity
                  </>
                )}
              </Button>

              <div className="grid gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10">
                    <Shield className="h-4 w-4 text-chart-3" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Secure Authentication</p>
                    <p className="text-xs text-muted-foreground">
                      Powered by Internet Computer's decentralized identity
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-4/10">
                    <Zap className="h-4 w-4 text-chart-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Real-time Monitoring</p>
                    <p className="text-xs text-muted-foreground">
                      Track agent execution and task progress live
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
