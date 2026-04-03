import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ActivityEvent } from "@/types/api";

async function fetchAtividades(limit = 50): Promise<ActivityEvent[]> {
  const { data } = await api.get<{ data: ActivityEvent[] }>("/relatorios/atividades", {
    params: { limit },
  });
  return data.data;
}

export function useAtividades(limit = 50) {
  return useQuery({
    queryKey: ["atividades"],
    queryFn: () => fetchAtividades(limit),
    staleTime: 10_000,
  });
}
