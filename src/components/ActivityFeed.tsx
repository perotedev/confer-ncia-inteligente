import { cn } from "@/lib/utils";
import type { ActivityEvent, ActivityType } from "@/types/api";
import { CheckCircle2, AlertTriangle, Wifi, WifiOff, Info } from "lucide-react";
import { format } from "date-fns";

const typeConfig: Record<ActivityType, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  CONFERENCIA: { icon: CheckCircle2, color: "text-status-success", bg: "bg-status-success/10" },
  DIVERGENCIA: { icon: AlertTriangle, color: "text-status-danger", bg: "bg-status-danger/10" },
  CONEXAO: { icon: Wifi, color: "text-status-info", bg: "bg-status-info/10" },
  DESCONEXAO: { icon: WifiOff, color: "text-status-idle", bg: "bg-status-idle/10" },
  STATUS: { icon: Info, color: "text-status-warning", bg: "bg-status-warning/10" },
};

function formatTime(timestamp: string): string {
  try {
    return format(new Date(timestamp), "HH:mm:ss");
  } catch {
    return timestamp;
  }
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-6">Nenhuma atividade registrada</p>
    );
  }

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
                {event.bancada.name} • {event.operator} • {formatTime(event.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
