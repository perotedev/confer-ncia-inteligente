import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Kpis } from "@/types/api";

async function fetchKpis(): Promise<Kpis> {
  const { data } = await api.get<{ data: Kpis }>("/kpis");
  return data.data;
}

export function useKpis() {
  return useQuery({
    queryKey: ["kpis"],
    queryFn: fetchKpis,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
