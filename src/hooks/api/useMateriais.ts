import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Material, MaterialStatus } from "@/types/api";

interface MateriaisFilter {
  bancadaId?: string;
  status?: MaterialStatus;
}

async function fetchMateriais(filters: MateriaisFilter = {}): Promise<Material[]> {
  const { data } = await api.get<{ data: Material[] }>("/materiais", { params: filters });
  return data.data;
}

export function useMateriais(filters: MateriaisFilter = {}) {
  return useQuery({
    queryKey: ["materiais", filters],
    queryFn: () => fetchMateriais(filters),
    staleTime: 10_000,
  });
}

export function useConferirMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, checkedQty, operator }: { id: string; checkedQty: number; operator: string }) =>
      api.post(`/materiais/${id}/conferir`, { checkedQty, operator }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["materiais"] });
      void queryClient.invalidateQueries({ queryKey: ["kpis"] });
      void queryClient.invalidateQueries({ queryKey: ["atividades"] });
    },
  });
}
