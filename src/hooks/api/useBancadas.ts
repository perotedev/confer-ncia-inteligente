import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Bancada } from "@/types/api";

async function fetchBancadas(): Promise<Bancada[]> {
  const { data } = await api.get<{ data: Bancada[] }>("/bancadas");
  return data.data;
}

export function useBancadas() {
  return useQuery({
    queryKey: ["bancadas"],
    queryFn: fetchBancadas,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}
