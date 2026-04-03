import { AppLayout } from "@/components/AppLayout";
import { MaterialsTable } from "@/components/MaterialsTable";
import { materials, bancadas } from "@/data/mockData";
import { ClipboardCheck, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const Conferencia = () => {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const filtered = materials.filter(m => {
    const matchStatus = statusFilter === "todos" || m.status === statusFilter;
    const matchSearch = search === "" || m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: materials.length,
    conferidos: materials.filter(m => m.status === "conferido").length,
    divergentes: materials.filter(m => m.status === "divergente").length,
    pendentes: materials.filter(m => m.status === "pendente").length,
  };

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

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          <div className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium">{stats.total} total</div>
          <div className="px-3 py-1.5 rounded-full bg-status-success/10 text-status-success text-xs font-medium">{stats.conferidos} conferidos</div>
          <div className="px-3 py-1.5 rounded-full bg-status-danger/10 text-status-danger text-xs font-medium">{stats.divergentes} divergentes</div>
          <div className="px-3 py-1.5 rounded-full bg-status-warning/10 text-status-warning text-xs font-medium">{stats.pendentes} pendentes</div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar material..." className="pl-9 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="conferido">Conferido</SelectItem>
              <SelectItem value="divergente">Divergente</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Bancada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {bancadas.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <MaterialsTable materials={filtered} />
      </div>
    </AppLayout>
  );
};

export default Conferencia;
