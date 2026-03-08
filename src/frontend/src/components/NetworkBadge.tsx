import { Badge } from "@/components/ui/badge";

interface Props {
  network: "ClickBank" | "JVZoo" | "WarriorPlus";
  className?: string;
}

const networkConfig = {
  ClickBank: {
    label: "ClickBank",
    className: "border-orange-500/30 bg-orange-500/15 text-orange-400",
  },
  JVZoo: {
    label: "JVZoo",
    className: "border-purple-500/30 bg-purple-500/15 text-purple-400",
  },
  WarriorPlus: {
    label: "WarriorPlus",
    className: "border-red-500/30 bg-red-500/15 text-red-400",
  },
};

export default function NetworkBadge({ network, className = "" }: Props) {
  const config = networkConfig[network] ?? networkConfig.ClickBank;
  return (
    <Badge
      variant="outline"
      className={`shrink-0 text-[10px] font-bold tracking-wide ${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
}
