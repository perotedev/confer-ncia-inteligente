import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { BancadaCard } from "@/components/BancadaCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { MaterialsTable } from "@/components/MaterialsTable";
import { kpis, bancadas, activityEvents, materials } from "@/data/mockData";
import { Monitor, Package, AlertTriangle, Clock, TrendingUp, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Dashboard de Conferência</h1>
          <p className="text-sm text-muted-foreground">Visão geral em tempo real da operação</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard title="Bancadas Ativas" value={`${kpis.bancadasAtivas}/${kpis.totalBancadas}`} icon={Monitor} variant="success" trend={{ value: 12, positive: true }} />
          <KpiCard title="Itens Conferidos" value={`${kpis.itensConferidos}/${kpis.totalItens}`} subtitle={`${Math.round((kpis.itensConferidos / kpis.totalItens) * 100)}% concluído`} icon={Package} variant="default" />
          <KpiCard title="Taxa de Divergência" value={`${kpis.taxaDivergencia}%`} subtitle={`${kpis.divergenciasPendentes} pendentes`} icon={AlertTriangle} variant="danger" trend={{ value: 2.1, positive: false }} />
          <KpiCard title="Tempo Médio" value={kpis.tempoMedioConferencia} subtitle={`${kpis.produtividadeMedia} itens/h`} icon={Clock} />
        </div>

        {/* Bancadas + Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Bancadas Conectadas
              </h2>
              <span className="text-xs text-muted-foreground">{bancadas.filter(b => b.status !== "inativa").length} ativas agora</span>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {bancadas.map((b) => (
                <BancadaCard key={b.id} bancada={b} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Atividade em Tempo Real
            </h2>
            <div className="rounded-xl border bg-card p-3 max-h-[420px] overflow-y-auto">
              <ActivityFeed events={activityEvents} />
            </div>
          </div>
        </div>

        {/* Materials table */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Últimos Materiais Conferidos
          </h2>
          <MaterialsTable materials={materials} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
