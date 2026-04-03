import { AppLayout } from "@/components/AppLayout";
import { Settings } from "lucide-react";

const Configuracoes = () => (
  <AppLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">Configurações gerais do sistema</p>
      </div>
      <div className="rounded-xl border bg-card p-12 flex items-center justify-center text-muted-foreground text-sm">
        Módulo de configurações em desenvolvimento
      </div>
    </div>
  </AppLayout>
);

export default Configuracoes;
