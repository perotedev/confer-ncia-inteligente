import type { Material, MaterialStatus } from "@/types/api";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const statusConfig: Record<MaterialStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  CONFERIDO: { label: "Conferido", icon: CheckCircle2, className: "bg-status-success/10 text-status-success border-0" },
  DIVERGENTE: { label: "Divergente", icon: AlertTriangle, className: "bg-status-danger/10 text-status-danger border-0" },
  PENDENTE: { label: "Pendente", icon: Clock, className: "bg-status-warning/10 text-status-warning border-0" },
};

interface MaterialsTableProps {
  materials: Material[];
}

export function MaterialsTable({ materials }: MaterialsTableProps) {
  if (materials.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhum material encontrado
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs">Código</TableHead>
            <TableHead className="text-xs">Material</TableHead>
            <TableHead className="text-xs text-center">Esperado</TableHead>
            <TableHead className="text-xs text-center">Conferido</TableHead>
            <TableHead className="text-xs text-center">Diferença</TableHead>
            <TableHead className="text-xs">Lote</TableHead>
            <TableHead className="text-xs">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((m) => {
            const diff = m.checkedQty - m.expectedQty;
            const sc = statusConfig[m.status];
            const Icon = sc.icon;
            return (
              <TableRow key={m.id} className={cn(m.status === "DIVERGENTE" && "bg-status-danger/5")}>
                <TableCell className="text-xs font-mono">{m.code}</TableCell>
                <TableCell className="text-xs font-medium">{m.name}</TableCell>
                <TableCell className="text-xs text-center">{m.expectedQty} {m.unit}</TableCell>
                <TableCell className="text-xs text-center font-medium">{m.checkedQty} {m.unit}</TableCell>
                <TableCell className="text-xs text-center">
                  {m.status === "PENDENTE" ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span className={cn("font-semibold", diff === 0 ? "text-status-success" : diff > 0 ? "text-status-warning" : "text-status-danger")}>
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{m.lot}</TableCell>
                <TableCell>
                  <Badge className={cn("text-[10px] gap-1", sc.className)}>
                    <Icon className="h-3 w-3" />
                    {sc.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
