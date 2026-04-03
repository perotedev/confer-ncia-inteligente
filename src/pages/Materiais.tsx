import { AppLayout } from "@/components/AppLayout";
import { Package } from "lucide-react";

const Materiais = () => (
  <AppLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Materiais
        </h1>
        <p className="text-sm text-muted-foreground">Cadastro e gestão de materiais</p>
      </div>
      <div className="rounded-xl border bg-card p-12 flex items-center justify-center text-muted-foreground text-sm">
        Módulo de cadastro de materiais em desenvolvimento
      </div>
    </div>
  </AppLayout>
);

export default Materiais;
