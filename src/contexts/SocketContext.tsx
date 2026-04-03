import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { SOCKET_URL } from "@/lib/api";
import type { ActivityEvent, Bancada, Kpis, Material, CheckflowSocketEvent } from "@/types/api";

interface SocketContextValue {
  connected: boolean;
  joinBancada: (bancadaId: string) => void;
  leaveBancada: (bancadaId: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  connected: false,
  joinBancada: () => {},
  leaveBancada: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => {
      console.warn("[socket] Erro de conexão:", err.message);
      setConnected(false);
    });

    // ── Atualização de bancada ────────────────────────────────
    socket.on("bancada:updated", (event: CheckflowSocketEvent<Bancada>) => {
      // Atualiza o item específico na lista em cache sem refetch
      queryClient.setQueryData<Bancada[]>(["bancadas"], (old) =>
        old ? old.map((b) => (b.id === event.payload.id ? event.payload : b)) : old,
      );
    });

    // ── Atualização de material ───────────────────────────────
    socket.on("material:updated", (event: CheckflowSocketEvent<Material>) => {
      queryClient.setQueryData<Material[]>(["materiais"], (old) =>
        old ? old.map((m) => (m.id === event.payload.id ? event.payload : m)) : old,
      );
      // Invalida para garantir consistência nos filtros
      void queryClient.invalidateQueries({ queryKey: ["materiais"] });
    });

    // ── Novo evento de atividade ──────────────────────────────
    socket.on("activity:new", (event: CheckflowSocketEvent<ActivityEvent>) => {
      queryClient.setQueryData<ActivityEvent[]>(["atividades"], (old) =>
        old ? [event.payload, ...old.slice(0, 49)] : [event.payload],
      );
    });

    // ── KPIs atualizados ──────────────────────────────────────
    socket.on("kpis:updated", (event: CheckflowSocketEvent<Kpis>) => {
      queryClient.setQueryData(["kpis"], event.payload);
    });

    return () => {
      socket.disconnect();
      setConnected(false);
    };
  }, [token, queryClient]);

  const joinBancada = (bancadaId: string) => {
    socketRef.current?.emit("bancada:join", bancadaId);
  };

  const leaveBancada = (bancadaId: string) => {
    socketRef.current?.emit("bancada:leave", bancadaId);
  };

  return (
    <SocketContext.Provider value={{ connected, joinBancada, leaveBancada }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
