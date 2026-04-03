// Tipos que espelham os enums e modelos do backend (Prisma)

export type UserRole = "OPERATOR" | "SUPERVISOR" | "ADMIN";

export type BancadaStatus = "ATIVA" | "INATIVA" | "CONFERINDO" | "DIVERGENCIA";
export type BancadaActivity = "DIGITANDO" | "CONFERINDO" | "OCIOSA";

export type MaterialStatus = "PENDENTE" | "CONFERIDO" | "DIVERGENTE";
export type DivergenceType = "SOBRA" | "FALTA";

export type ActivityType =
  | "CONFERENCIA"
  | "DIVERGENCIA"
  | "CONEXAO"
  | "DESCONEXAO"
  | "STATUS";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Bancada {
  id: string;
  name: string;
  operator: Pick<User, "id" | "name" | "email" | "role"> | null;
  operatorId: string | null;
  status: BancadaStatus;
  activity: BancadaActivity;
  itemsConferidos: number;
  itemsTotal: number;
  divergencias: number;
  lastActivity: string | null;
  createdAt: string;
  updatedAt: string;
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
  bancada: { id: string; name: string };
  status: MaterialStatus;
  divergenceType: DivergenceType | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  bancadaId: string;
  bancada: { id: string; name: string };
  operator: string;
  type: ActivityType;
  message: string;
  createdAt: string;
}

export interface Kpis {
  totalBancadas: number;
  bancadasAtivas: number;
  totalItens: number;
  itensConferidos: number;
  taxaDivergencia: number;
  tempoMedioConferencia: string;
  produtividadeMedia: number;
  divergenciasPendentes: number;
}

// Eventos Socket.IO
export interface CheckflowSocketEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}
