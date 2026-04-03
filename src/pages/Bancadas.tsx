import { AppLayout } from "@/components/AppLayout";
import { BancadaCard } from "@/components/BancadaCard";
import { bancadas } from "@/data/mockData";
import { Monitor, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Bancadas = () => {
  const ativas = bancadas.filter(b => b.status !== "inativa");
  const comDivergencia = bancadas.filter(b => b.status === "divergencia");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Bancadas
            </h1>
            <p className="text-sm text-muted-foreground">Gerencie e monitore todas as estações de trabalho</p>
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Nova Bancada
          </Button>
        </div>

        <Tabs defaultValue="todas">
          <TabsList>
            <TabsTrigger value="todas">Todas ({bancadas.length})</TabsTrigger>
            <TabsTrigger value="ativas">Ativas ({ativas.length})</TabsTrigger>
            <TabsTrigger value="divergencias">Divergências ({comDivergencia.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="todas" className="mt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bancadas.map(b => <BancadaCard key={b.id} bancada={b} />)}
            </div>
          </TabsContent>
          <TabsContent value="ativas" className="mt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ativas.map(b => <BancadaCard key={b.id} bancada={b} />)}
            </div>
          </TabsContent>
          <TabsContent value="divergencias" className="mt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {comDivergencia.map(b => <BancadaCard key={b.id} bancada={b} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Bancadas;
