import { PrismaClient, Role, BancadaStatus, BancadaActivity, MaterialStatus, DivergenceType, ActivityType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // ── Usuários ─────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 10);
  const supervisorPassword = await bcrypt.hash("super123", 10);
  const operatorPassword = await bcrypt.hash("oper123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@checkflow.com" },
    update: {},
    create: { name: "Carlos Admin", email: "admin@checkflow.com", password: adminPassword, role: Role.ADMIN },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: "supervisor@checkflow.com" },
    update: {},
    create: { name: "Ana Supervisora", email: "supervisor@checkflow.com", password: supervisorPassword, role: Role.SUPERVISOR },
  });

  const operator = await prisma.user.upsert({
    where: { email: "operador@checkflow.com" },
    update: {},
    create: { name: "João Operador", email: "operador@checkflow.com", password: operatorPassword, role: Role.OPERATOR },
  });

  console.log(`✅ Usuários: ${admin.email}, ${supervisor.email}, ${operator.email}`);

  // ── Bancadas ─────────────────────────────────────────────────
  const bancadasData = [
    { id: "b001", name: "Bancada 01", status: BancadaStatus.CONFERINDO,  activity: BancadaActivity.CONFERINDO, itemsConferidos: 42, itemsTotal: 60, divergencias: 2 },
    { id: "b002", name: "Bancada 02", status: BancadaStatus.ATIVA,       activity: BancadaActivity.DIGITANDO,  itemsConferidos: 28, itemsTotal: 45, divergencias: 0 },
    { id: "b003", name: "Bancada 03", status: BancadaStatus.DIVERGENCIA, activity: BancadaActivity.OCIOSA,     itemsConferidos: 35, itemsTotal: 50, divergencias: 5 },
    { id: "b004", name: "Bancada 04", status: BancadaStatus.ATIVA,       activity: BancadaActivity.CONFERINDO, itemsConferidos: 18, itemsTotal: 30, divergencias: 1 },
    { id: "b005", name: "Bancada 05", status: BancadaStatus.INATIVA,     activity: BancadaActivity.OCIOSA,     itemsConferidos: 0,  itemsTotal: 0,  divergencias: 0 },
    { id: "b006", name: "Bancada 06", status: BancadaStatus.CONFERINDO,  activity: BancadaActivity.CONFERINDO, itemsConferidos: 55, itemsTotal: 70, divergencias: 3 },
  ];

  for (const data of bancadasData) {
    await prisma.bancada.upsert({
      where: { id: data.id },
      update: {},
      create: { ...data, lastActivity: new Date() },
    });
  }
  console.log(`✅ ${bancadasData.length} bancadas criadas`);

  // ── Materiais ─────────────────────────────────────────────────
  const materiaisData = [
    { code: "MAT-10234", name: "Parafuso Sextavado M8x30",   expectedQty: 500,  checkedQty: 500, unit: "un", lot: "LT-2024-001", expiry: new Date("2026-12-31"), bancadaId: "b001", status: MaterialStatus.CONFERIDO },
    { code: "MAT-10235", name: 'Arruela Lisa 3/8"',          expectedQty: 1000, checkedQty: 985, unit: "un", lot: "LT-2024-002", expiry: new Date("2027-06-30"), bancadaId: "b001", status: MaterialStatus.DIVERGENTE, divergenceType: DivergenceType.FALTA },
    { code: "MAT-10236", name: "Porca Sextavada M10",        expectedQty: 300,  checkedQty: 300, unit: "un", lot: "LT-2024-003", expiry: new Date("2026-09-15"), bancadaId: "b001", status: MaterialStatus.CONFERIDO },
    { code: "MAT-10237", name: "Tubo PVC 50mm x 6m",         expectedQty: 20,   checkedQty: 22,  unit: "un", lot: "LT-2024-004", expiry: new Date("2028-03-20"), bancadaId: "b003", status: MaterialStatus.DIVERGENTE, divergenceType: DivergenceType.SOBRA },
    { code: "MAT-10238", name: "Chapa Aço 1020 2mm",         expectedQty: 50,   checkedQty: 0,   unit: "un", lot: "LT-2024-005", expiry: new Date("2027-01-10"), bancadaId: "b002", status: MaterialStatus.PENDENTE },
    { code: "MAT-10239", name: "Rolamento 6205 ZZ",          expectedQty: 100,  checkedQty: 100, unit: "un", lot: "LT-2024-006", expiry: new Date("2029-05-01"), bancadaId: "b004", status: MaterialStatus.CONFERIDO },
    { code: "MAT-10240", name: "Correia Dentada HTD 5M",     expectedQty: 15,   checkedQty: 12,  unit: "un", lot: "LT-2024-007", expiry: new Date("2027-08-22"), bancadaId: "b003", status: MaterialStatus.DIVERGENTE, divergenceType: DivergenceType.FALTA },
    { code: "MAT-10241", name: "Graxa Industrial EP2",       expectedQty: 30,   checkedQty: 0,   unit: "kg", lot: "LT-2024-008", expiry: new Date("2025-11-30"), bancadaId: "b006", status: MaterialStatus.PENDENTE },
  ];

  for (const mat of materiaisData) {
    await prisma.material.upsert({
      where: { id: mat.code },
      update: {},
      create: { id: mat.code, ...mat },
    });
  }
  console.log(`✅ ${materiaisData.length} materiais criados`);

  // ── Eventos de atividade ──────────────────────────────────────
  await prisma.activityEvent.createMany({
    data: [
      { bancadaId: "b001", operator: "Carlos Silva",   type: ActivityType.CONFERENCIA, message: "Conferiu MAT-10234 — 500/500 un ✓" },
      { bancadaId: "b001", operator: "Carlos Silva",   type: ActivityType.DIVERGENCIA, message: "Divergência: MAT-10235 — falta de 15 un" },
      { bancadaId: "b003", operator: "Pedro Lima",     type: ActivityType.DIVERGENCIA, message: "Divergência: MAT-10240 — falta de 3 un" },
      { bancadaId: "b006", operator: "Fernanda Costa", type: ActivityType.CONFERENCIA, message: "Conferiu MAT-10241 — iniciou conferência" },
      { bancadaId: "b002", operator: "Ana Souza",      type: ActivityType.CONEXAO,     message: "Bancada 02 conectada ao sistema" },
      { bancadaId: "b005", operator: "João Santos",    type: ActivityType.DESCONEXAO,  message: "Bancada 05 ficou inativa" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Eventos de atividade criados");
  console.log("🎉 Seed concluído!");
}

main()
  .catch((e) => { console.error("❌ Erro no seed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
