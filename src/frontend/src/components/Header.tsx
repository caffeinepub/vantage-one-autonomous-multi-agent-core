import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllAutomationStatuses } from "../hooks/useQueries";

export default function Header() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: automationStatuses } = useGetAllAutomationStatuses();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const principalId = identity?.getPrincipal().toString();
  const shortPrincipal = principalId
    ? `${principalId.slice(0, 5)}…${principalId.slice(-3)}`
    : "User";

  const activeAgents =
    automationStatuses?.filter(([, s]) => s.running).length ?? 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-lg glow-blue">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display text-base font-black tracking-widest text-foreground">
              VANTAGE<span className="text-primary">ONE</span>
            </span>
            <p className="text-[10px] font-mono tracking-wider text-muted-foreground -mt-0.5 hidden sm:block">
              AI AFFILIATE OS
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {activeAgents > 0 && (
            <Badge className="gap-1.5 border-chart-2/30 bg-chart-2/10 text-chart-2 text-xs font-mono animate-pulse hidden sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-2 inline-block" />
              {activeAgents} ACTIVE
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-ocid="header.user.button"
                variant="ghost"
                className="relative h-9 gap-2 px-2"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gradient-to-br from-primary/80 to-chart-3/80 text-xs font-bold text-white">
                    <User className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-xs font-mono font-medium sm:block text-muted-foreground">
                  {shortPrincipal}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold">Vantage One</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {shortPrincipal}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-ocid="header.logout.button"
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
