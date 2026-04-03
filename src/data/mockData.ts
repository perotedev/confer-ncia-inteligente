export type BancadaStatus = "ativa" | "inativa" | "conferindo" | "divergencia";
export type BancadaActivity = "digitando" | "conferindo" | "ociosa";
export type DivergenceType = "sobra" | "falta";

export interface Bancada {
  id: string;
  name: string;
  operator: string;
  status: BancadaStatus;
  activity: BancadaActivity;
  itemsConferidos: number;
  itemsTotal: number;
  divergencias: number;
  lastActivity: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  expectedQty: number;
  checkedQty: number;
  unit: string;
  lot: string;
  expiry: string;
  bancadaId: string;
  status: "pendente" | "conferido" | "divergente";
  divergenceType?: DivergenceType;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  bancadaId: string;
  bancadaName: string;
  operator: string;
  type: "conferencia" | "divergencia" | "conexao" | "desconexao" | "status";
  message: string;
}

export const bancadas: Bancada[] = [
  { id: "B001", name: "Bancada 01", operator: "Carlos Silva", status: "conferindo", activity: "conferindo", itemsConferidos: 42, itemsTotal: 60, divergencias: 2, lastActivity: "há 15s" },
  { id: "B002", name: "Bancada 02", operator: "Ana Souza", status: "ativa", activity: "digitando", itemsConferidos: 28, itemsTotal: 45, divergencias: 0, lastActivity: "há 3s" },
  { id: "B003", name: "Bancada 03", operator: "Pedro Lima", status: "divergencia", activity: "ociosa", itemsConferidos: 35, itemsTotal: 50, divergencias: 5, lastActivity: "há 2min" },
  { id: "B004", name: "Bancada 04", operator: "Maria Oliveira", status: "ativa", activity: "conferindo", itemsConferidos: 18, itemsTotal: 30, divergencias: 1, lastActivity: "há 8s" },
  { id: "B005", name: "Bancada 05", operator: "João Santos", status: "inativa", activity: "ociosa", itemsConferidos: 0, itemsTotal: 0, divergencias: 0, lastActivity: "há 30min" },
  { id: "B006", name: "Bancada 06", operator: "Fernanda Costa", status: "conferindo", activity: "conferindo", itemsConferidos: 55, itemsTotal: 70, divergencias: 3, lastActivity: "há 5s" },
];

export const materials: Material[] = [
  { id: "M001", code: "MAT-10234", name: "Parafuso Sextavado M8x30", expectedQty: 500, checkedQty: 500, unit: "un", lot: "LT-2024-001", expiry: "2026-12-31", bancadaId: "B001", status: "conferido" },
  { id: "M002", code: "MAT-10235", name: "Arruela Lisa 3/8\"", expectedQty: 1000, checkedQty: 985, unit: "un", lot: "LT-2024-002", expiry: "2027-06-30", bancadaId: "B001", status: "divergente", divergenceType: "falta" },
  { id: "M003", code: "MAT-10236", name: "Porca Sextavada M10", expectedQty: 300, checkedQty: 300, unit: "un", lot: "LT-2024-003", expiry: "2026-09-15", bancadaId: "B001", status: "conferido" },
  { id: "M004", code: "MAT-10237", name: "Tubo PVC 50mm x 6m", expectedQty: 20, checkedQty: 22, unit: "un", lot: "LT-2024-004", expiry: "2028-03-20", bancadaId: "B003", status: "divergente", divergenceType: "sobra" },
  { id: "M005", code: "MAT-10238", name: "Chapa Aço 1020 2mm", expectedQty: 50, checkedQty: 0, unit: "un", lot: "LT-2024-005", expiry: "2027-01-10", bancadaId: "B002", status: "pendente" },
  { id: "M006", code: "MAT-10239", name: "Rolamento 6205 ZZ", expectedQty: 100, checkedQty: 100, unit: "un", lot: "LT-2024-006", expiry: "2029-05-01", bancadaId: "B004", status: "conferido" },
  { id: "M007", code: "MAT-10240", name: "Correia Dentada HTD 5M", expectedQty: 15, checkedQty: 12, unit: "un", lot: "LT-2024-007", expiry: "2027-08-22", bancadaId: "B003", status: "divergente", divergenceType: "falta" },
  { id: "M008", code: "MAT-10241", name: "Graxa Industrial EP2", expectedQty: 30, checkedQty: 0, unit: "kg", lot: "LT-2024-008", expiry: "2025-11-30", bancadaId: "B006", status: "pendente" },
];

export const activityEvents: ActivityEvent[] = [
  { id: "E001", timestamp: "14:32:15", bancadaId: "B001", bancadaName: "Bancada 01", operator: "Carlos Silva", type: "conferencia", message: "Conferiu MAT-10234 — 500/500 un ✓" },
  { id: "E002", timestamp: "14:31:48", bancadaId: "B001", bancadaName: "Bancada 01", operator: "Carlos Silva", type: "divergencia", message: "Divergência: MAT-10235 — falta de 15 un" },
  { id: "E003", timestamp: "14:30:22", bancadaId: "B003", bancadaName: "Bancada 03", operator: "Pedro Lima", type: "divergencia", message: "Divergência: MAT-10240 — falta de 3 un" },
  { id: "E004", timestamp: "14:28:10", bancadaId: "B006", bancadaName: "Bancada 06", operator: "Fernanda Costa", type: "conferencia", message: "Conferiu MAT-10241 — iniciou conferência" },
  { id: "E005", timestamp: "14:25:00", bancadaId: "B002", bancadaName: "Bancada 02", operator: "Ana Souza", type: "conexao", message: "Bancada 02 conectada ao sistema" },
  { id: "E006", timestamp: "14:20:33", bancadaId: "B005", bancadaName: "Bancada 05", operator: "João Santos", type: "desconexao", message: "Bancada 05 ficou inativa" },
];

export const kpis = {
  totalBancadas: 6,
  bancadasAtivas: 5,
  totalItens: 255,
  itensConferidos: 178,
  taxaDivergencia: 4.3,
  tempoMedioConferencia: "2m 14s",
  produtividadeMedia: 31.2,
  divergenciasPendentes: 11,
};
