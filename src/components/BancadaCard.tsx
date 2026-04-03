import { cn } from "@/lib/utils";
import type { Bancada, BancadaStatus, BancadaActivity } from "@/types/api";
import { Monitor, AlertTriangle, CheckCircle2, Pause, Keyboard, ScanBarcode, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<BancadaStatus, { label: string; color: string; bgColor: string; icon: typeof Monitor }> = {
  ATIVA: { label: "Ativa", color: "text-status-success", bgColor: "bg-status-success/10", icon: CheckCircle2 },
  INATIVA: { label: "Inativa", color: "text-status-idle", bgColor: "bg-status-idle/10", icon: Pause },
  CONFERINDO: { label: "Em Conferência", color: "text-status-info", bgColor: "bg-status-info/10", icon: ScanBarcode },
  DIVERGENCIA: { label: "Com Divergência", color: "text-status-danger", bgColor: "bg-status-danger/10", icon: AlertTriangle },
};

const activityConfig: Record<BancadaActivity, { label: string; icon: typeof Keyboard }> = {
  DIGITANDO: { label: "Digitando...", icon: Keyboard },
  CONFERINDO: { label: "Conferindo...", icon: ScanBarcode },
  OCIOSA: { label: "Ociosa", icon: Clock },
};

function timeAgo(date: string | null): string {
  if (!date) return "—";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  } catch {
    return "—";
  }
}

interface BancadaCardProps {
  bancada: Bancada;
}

export function BancadaCard({ bancada }: BancadaCardProps) {
  const sc = statusConfig[bancada.status];
  const ac = activityConfig[bancada.activity];
  const progress = bancada.itemsTotal > 0 ? (bancada.itemsConferidos / bancada.itemsTotal) * 100 : 0;
  const StatusIcon = sc.icon;
  const ActivityIcon = ac.icon;

  return (
    <div className={cn("kpi-card animate-fade-in relative overflow-hidden", bancada.status === "DIVERGENCIA" && "border-status-danger/30")}>
      <div className={cn("absolute top-0 left-0 w-1 h-full rounded-l-xl", sc.bgColor.replace("/10", ""))} />

      <div className="pl-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">{bancada.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{bancada.operator?.name ?? "Sem operador"}</p>
          </div>
          <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", sc.bgColor, sc.color)}>
            <StatusIcon className="h-3 w-3" />
            {sc.label}
          </span>
        </div>

        {bancada.itemsTotal > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{bancada.itemsConferidos}/{bancada.itemsTotal} itens</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className={cn("flex items-center gap-1", bancada.activity !== "OCIOSA" ? "text-status-info" : "text-muted-foreground")}>
            <ActivityIcon className="h-3 w-3" />
            {bancada.activity !== "OCIOSA" && <span className="status-pulse">●</span>}
            {ac.label}
          </span>
          {bancada.divergencias > 0 && (
            <span className="flex items-center gap-1 text-status-danger font-medium">
              <AlertTriangle className="h-3 w-3" />
              {bancada.divergencias} div.
            </span>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground mt-2">
          Última atividade: {timeAgo(bancada.lastActivity)}
        </p>
      </div>
    </div>
  );
}
