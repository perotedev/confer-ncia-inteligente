import { AppLayout } from "@/components/AppLayout";
import { FileBarChart } from "lucide-react";

const Relatorios = () => (
  <AppLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-primary" />
          Relatórios
        </h1>
        <p className="text-sm text-muted-foreground">Relatórios e exportações</p>
      </div>
      <div className="rounded-xl border bg-card p-12 flex items-center justify-center text-muted-foreground text-sm">
        Módulo de relatórios em desenvolvimento
      </div>
    </div>
  </AppLayout>
);

export default Relatorios;
