import { AppLayout } from "@/components/AppLayout";
import { BancadaCard } from "@/components/BancadaCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useBancadas } from "@/hooks/api/useBancadas";
import { Monitor, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function GridSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}

const Bancadas = () => {
  const { data: bancadas, isLoading } = useBancadas();

  const ativas = bancadas?.filter((b) => b.status !== "INATIVA") ?? [];
  const comDivergencia = bancadas?.filter((b) => b.status === "DIVERGENCIA") ?? [];

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
            <TabsTrigger value="todas">Todas ({bancadas?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="ativas">Ativas ({ativas.length})</TabsTrigger>
            <TabsTrigger value="divergencias">Divergências ({comDivergencia.length})</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="mt-4">
              <GridSkeleton />
            </div>
          ) : (
            <>
              <TabsContent value="todas" className="mt-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {bancadas?.map((b) => <BancadaCard key={b.id} bancada={b} />)}
                </div>
              </TabsContent>
              <TabsContent value="ativas" className="mt-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ativas.map((b) => <BancadaCard key={b.id} bancada={b} />)}
                </div>
              </TabsContent>
              <TabsContent value="divergencias" className="mt-4">
                {comDivergencia.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">Nenhuma divergência no momento</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {comDivergencia.map((b) => <BancadaCard key={b.id} bancada={b} />)}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Bancadas;
