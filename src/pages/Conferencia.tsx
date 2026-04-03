import { AppLayout } from "@/components/AppLayout";
import { MaterialsTable } from "@/components/MaterialsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useBancadas } from "@/hooks/api/useBancadas";
import { useMateriais } from "@/hooks/api/useMateriais";
import type { MaterialStatus } from "@/types/api";
import { ClipboardCheck, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";

const Conferencia = () => {
  const [statusFilter, setStatusFilter] = useState<MaterialStatus | "TODOS">("TODOS");
  const [bancadaFilter, setBancadaFilter] = useState("TODAS");
  const [search, setSearch] = useState("");

  const { data: bancadas } = useBancadas();
  const { data: materiais, isLoading } = useMateriais();

  const filtered = useMemo(() => {
    if (!materiais) return [];
    return materiais.filter((m) => {
      const matchStatus = statusFilter === "TODOS" || m.status === statusFilter;
      const matchBancada = bancadaFilter === "TODAS" || m.bancadaId === bancadaFilter;
      const matchSearch =
        search === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.code.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchBancada && matchSearch;
    });
  }, [materiais, statusFilter, bancadaFilter, search]);

  const stats = useMemo(() => ({
    total: materiais?.length ?? 0,
    conferidos: materiais?.filter((m) => m.status === "CONFERIDO").length ?? 0,
    divergentes: materiais?.filter((m) => m.status === "DIVERGENTE").length ?? 0,
    pendentes: materiais?.filter((m) => m.status === "PENDENTE").length ?? 0,
  }), [materiais]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Conferência de Materiais
            </h1>
            <p className="text-sm text-muted-foreground">Acompanhe a conferência de todos os materiais</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>

        {/* Resumo */}
        <div className="flex flex-wrap gap-3">
          <div className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium">{stats.total} total</div>
          <div className="px-3 py-1.5 rounded-full bg-status-success/10 text-status-success text-xs font-medium">{stats.conferidos} conferidos</div>
          <div className="px-3 py-1.5 rounded-full bg-status-danger/10 text-status-danger text-xs font-medium">{stats.divergentes} divergentes</div>
          <div className="px-3 py-1.5 rounded-full bg-status-warning/10 text-status-warning text-xs font-medium">{stats.pendentes} pendentes</div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar material..."
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MaterialStatus | "TODOS")}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="CONFERIDO">Conferido</SelectItem>
              <SelectItem value="DIVERGENTE">Divergente</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={bancadaFilter} onValueChange={setBancadaFilter}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Bancada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas</SelectItem>
              {bancadas?.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 rounded-lg" />
        ) : (
          <MaterialsTable materials={filtered} />
        )}
      </div>
    </AppLayout>
  );
};

export default Conferencia;
