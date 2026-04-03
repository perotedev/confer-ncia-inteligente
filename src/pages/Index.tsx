import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { BancadaCard } from "@/components/BancadaCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { MaterialsTable } from "@/components/MaterialsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useKpis } from "@/hooks/api/useKpis";
import { useBancadas } from "@/hooks/api/useBancadas";
import { useAtividades } from "@/hooks/api/useAtividades";
import { useMateriais } from "@/hooks/api/useMateriais";
import { Monitor, Package, AlertTriangle, Clock, TrendingUp, BarChart3 } from "lucide-react";

function KpisSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

const Index = () => {
  const { data: kpis, isLoading: kpisLoading } = useKpis();
  const { data: bancadas, isLoading: bancadasLoading } = useBancadas();
  const { data: atividades, isLoading: atividadesLoading } = useAtividades(20);
  const { data: materiais, isLoading: materiaisLoading } = useMateriais();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Dashboard de Conferência</h1>
          <p className="text-sm text-muted-foreground">Visão geral em tempo real da operação</p>
        </div>

        {/* KPIs */}
        {kpisLoading ? (
          <KpisSkeleton />
        ) : kpis ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              title="Bancadas Ativas"
              value={`${kpis.bancadasAtivas}/${kpis.totalBancadas}`}
              icon={Monitor}
              variant="success"
            />
            <KpiCard
              title="Itens Conferidos"
              value={`${kpis.itensConferidos}/${kpis.totalItens}`}
              subtitle={kpis.totalItens > 0 ? `${Math.round((kpis.itensConferidos / kpis.totalItens) * 100)}% concluído` : ""}
              icon={Package}
              variant="default"
            />
            <KpiCard
              title="Taxa de Divergência"
              value={`${kpis.taxaDivergencia}%`}
              subtitle={`${kpis.divergenciasPendentes} pendentes`}
              icon={AlertTriangle}
              variant="danger"
            />
            <KpiCard
              title="Tempo Médio"
              value={kpis.tempoMedioConferencia}
              subtitle={`${kpis.produtividadeMedia} itens/h`}
              icon={Clock}
            />
          </div>
        ) : null}

        {/* Bancadas + Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Bancadas Conectadas
              </h2>
              {bancadas && (
                <span className="text-xs text-muted-foreground">
                  {bancadas.filter((b) => b.status !== "INATIVA").length} ativas agora
                </span>
              )}
            </div>
            {bancadasLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {bancadas?.map((b) => <BancadaCard key={b.id} bancada={b} />)}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Atividade em Tempo Real
            </h2>
            <div className="rounded-xl border bg-card p-3 max-h-[420px] overflow-y-auto">
              {atividadesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : (
                <ActivityFeed events={atividades ?? []} />
              )}
            </div>
          </div>
        </div>

        {/* Tabela de materiais */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Últimos Materiais Conferidos
          </h2>
          {materiaisLoading ? (
            <Skeleton className="h-48 rounded-lg" />
          ) : (
            <MaterialsTable materials={(materiais ?? []).slice(0, 8)} />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
