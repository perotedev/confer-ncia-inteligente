import { cn } from "@/lib/utils";
import { ActivityEvent } from "@/data/mockData";
import { CheckCircle2, AlertTriangle, Wifi, WifiOff, Info } from "lucide-react";

const typeConfig = {
  conferencia: { icon: CheckCircle2, color: "text-status-success", bg: "bg-status-success/10" },
  divergencia: { icon: AlertTriangle, color: "text-status-danger", bg: "bg-status-danger/10" },
  conexao: { icon: Wifi, color: "text-status-info", bg: "bg-status-info/10" },
  desconexao: { icon: WifiOff, color: "text-status-idle", bg: "bg-status-idle/10" },
  status: { icon: Info, color: "text-status-warning", bg: "bg-status-warning/10" },
};

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <div className="space-y-1">
      {events.map((event) => {
        const config = typeConfig[event.type];
        const Icon = config.icon;
        return (
          <div key={event.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in">
            <div className={cn("p-1.5 rounded-md shrink-0 mt-0.5", config.bg)}>
              <Icon className={cn("h-3.5 w-3.5", config.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-relaxed">{event.message}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {event.bancadaName} • {event.operator} • {event.timestamp}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
