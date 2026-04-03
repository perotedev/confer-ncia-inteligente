import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/contexts/SocketContext";
import { useBancadas } from "@/hooks/api/useBancadas";
import { useKpis } from "@/hooks/api/useKpis";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { connected } = useSocket();
  const { data: bancadas } = useBancadas();
  const { data: kpis } = useKpis();

  const bancadasAtivas = kpis?.bancadasAtivas ?? bancadas?.filter((b) => b.status !== "INATIVA").length ?? 0;
  const divergenciasPendentes = kpis?.divergenciasPendentes ?? 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {connected ? (
                  <Wifi className="h-3.5 w-3.5 text-status-success" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-status-danger" />
                )}
                <span className={connected ? "text-status-success" : "text-status-danger"}>
                  {connected ? "Conectado" : "Desconectado"}
                </span>
                {bancadasAtivas > 0 && (
                  <>
                    <span className="text-border">•</span>
                    <span>{bancadasAtivas} bancada{bancadasAtivas !== 1 ? "s" : ""} ativa{bancadasAtivas !== 1 ? "s" : ""}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-md hover:bg-muted transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
                {divergenciasPendentes > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-status-danger text-status-danger-foreground border-0">
                    {divergenciasPendentes > 9 ? "9+" : divergenciasPendentes}
                  </Badge>
                )}
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
