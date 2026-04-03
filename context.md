# CheckFlow — Conferência Inteligente

## Visão Geral

Sistema web de **monitoramento e conferência de materiais** em estações de trabalho (bancadas). Permite que supervisores acompanhem em tempo real o progresso da conferência, identifiquem divergências e gerenciem operadores.

O produto é chamado **CheckFlow** internamente (ver branding no sidebar).

---

## Stack Tecnológica

### Frontend
| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Roteamento | React Router v6 |
| Estado assíncrono | TanStack Query v5 |
| UI base | shadcn/ui (Radix UI primitives) |
| Estilo | Tailwind CSS v3 |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Testes unitários | Vitest + Testing Library |
| Testes e2e | Playwright |

### Backend
| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 + TypeScript |
| Framework HTTP | Express 4 |
| ORM | Prisma 5 |
| Banco de dados | PostgreSQL 16 |
| Cache / Pub-Sub | Redis 7 (ioredis) |
| WebSocket | Socket.IO 4 |
| Escalabilidade WS | @socket.io/redis-adapter |
| Autenticação | JWT (jsonwebtoken) + bcryptjs |
| Validação | Zod |
| Load Balancer | Nginx (sticky sessions via ip_hash) |
| Containerização | Docker + Docker Compose |

---

## Estrutura de Arquivos

### Frontend
```
src/
├── App.tsx                  # Rotas, providers globais
├── contexts/
│   └── AuthContext.tsx       # Autenticação (mock), papéis de usuário
├── components/
│   ├── AppLayout.tsx         # Layout wrapper com sidebar
│   ├── AppSidebar.tsx        # Navegação lateral (CheckFlow)
│   ├── BancadaCard.tsx       # Card de status por bancada
│   ├── KpiCard.tsx           # Card de métricas do dashboard
│   ├── MaterialsTable.tsx    # Tabela de materiais conferidos
│   ├── ActivityFeed.tsx      # Feed de eventos em tempo real
│   └── NavLink.tsx           # Link de navegação com active state
├── pages/
│   ├── Index.tsx             # Dashboard principal (KPIs + bancadas + feed)
│   ├── Bancadas.tsx          # Gestão das estações de trabalho
│   ├── Conferencia.tsx       # Conferência de materiais com filtros
│   ├── Materiais.tsx         # Listagem de materiais
│   ├── Relatorios.tsx        # Relatórios
│   ├── Configuracoes.tsx     # Configurações do sistema
│   ├── Login.tsx             # Autenticação
│   ├── Register.tsx          # Cadastro
│   └── ForgotPassword.tsx    # Recuperação de senha
├── data/
│   └── mockData.ts           # Dados mockados (sem backend ainda)
└── hooks/
    ├── use-mobile.tsx
    └── use-toast.ts
```

### Backend
```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco (User, Bancada, Material, ActivityEvent)
│   └── seed.ts                # Seed com dados do mockData.ts
├── src/
│   ├── config/
│   │   ├── database.ts        # Singleton PrismaClient
│   │   └── redis.ts           # 4 conexões Redis (geral, sub, pub-adapter, sub-adapter)
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── bancada.controller.ts
│   │   ├── material.controller.ts
│   │   ├── kpi.controller.ts
│   │   └── relatorio.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT authenticate + RBAC authorize
│   │   └── error.middleware.ts # AppError + ZodError handler global
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── bancada.routes.ts
│   │   ├── material.routes.ts
│   │   ├── kpi.routes.ts
│   │   └── relatorio.routes.ts
│   ├── services/
│   │   ├── auth.service.ts    # Login, register, reset password
│   │   ├── bancada.service.ts # CRUD + update de status
│   │   ├── material.service.ts # CRUD + lógica de conferência/divergência
│   │   ├── kpi.service.ts     # Agregação de métricas em tempo real
│   │   └── event.service.ts   # Publish para Redis Pub/Sub
│   ├── socket/
│   │   ├── index.ts           # Inicializa Socket.IO + Redis Adapter + subscriber Redis
│   │   └── handlers.ts        # Auth middleware WS + event handlers por socket
│   ├── types/
│   │   └── index.ts           # JwtPayload, CheckflowEvent, tipos compartilhados
│   ├── app.ts                 # Express app (middlewares + rotas)
│   └── server.ts              # Bootstrap: DB + Redis + HTTP + Socket.IO + graceful shutdown
├── docker-compose.yml         # PostgreSQL + Redis + 2x App + Nginx
├── Dockerfile                 # Multi-stage build
├── nginx.conf                 # Load balancer com sticky sessions (ip_hash)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Arquitetura de Tempo Real

```
Cliente (Browser)
      │  WebSocket (Socket.IO)
      ▼
  Nginx (ip_hash — sticky session)
      │
  ┌───┴────────────┐
  │  App Instance 1 │   App Instance 2
  └───────┬────────┘         │
          │    @socket.io/redis-adapter
          └────────┬─────────┘
                   ▼
              Redis Pub/Sub
              (checkflow:events)
                   ▲
         EventService.publish()
                   │
         Services (bancada, material, kpi)
                   │
              PostgreSQL
```

**Fluxo de evento:**
1. REST request chega em qualquer instância
2. Service processa e salva no PostgreSQL
3. `eventService.publish(type, payload)` → publica no canal Redis `checkflow:events`
4. Cada instância tem um subscriber Redis que recebe o evento
5. O subscriber chama `io.to("global").emit(type, event)`
6. O Redis Adapter sincroniza o emit entre todas as instâncias
7. Todos os clientes conectados recebem o evento em tempo real

---

## API REST

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | público | Login → retorna JWT |
| POST | `/api/auth/register` | público | Cadastro |
| POST | `/api/auth/forgot-password` | público | Reset de senha |
| GET | `/api/auth/me` | JWT | Usuário atual |
| GET | `/api/bancadas` | JWT | Lista bancadas |
| POST | `/api/bancadas` | SUPERVISOR/ADMIN | Cria bancada |
| GET | `/api/bancadas/:id` | JWT | Detalhes + materials + events |
| PUT | `/api/bancadas/:id` | SUPERVISOR/ADMIN | Atualiza + emite evento WS |
| DELETE | `/api/bancadas/:id` | ADMIN | Remove |
| GET | `/api/bancadas/:id/activities` | JWT | Histórico de atividades |
| GET | `/api/materiais` | JWT | Lista (filtros: bancadaId, status) |
| POST | `/api/materiais` | SUPERVISOR/ADMIN | Cria material |
| POST | `/api/materiais/:id/conferir` | JWT | Confere item → detecta divergência → emite eventos WS |
| DELETE | `/api/materiais/:id` | ADMIN | Remove |
| GET | `/api/kpis` | JWT | KPIs calculados em tempo real |
| GET | `/api/relatorios/divergencias` | SUPERVISOR/ADMIN | Relatório de divergências |
| GET | `/api/relatorios/produtividade` | SUPERVISOR/ADMIN | Produtividade por bancada |
| GET | `/api/relatorios/atividades` | SUPERVISOR/ADMIN | Feed completo de atividades |

## Socket.IO Events

| Direção | Evento | Descrição |
|---|---|---|
| Cliente → Servidor | `bancada:join` | Entra na sala da bancada (updates filtrados) |
| Cliente → Servidor | `bancada:leave` | Sai da sala |
| Servidor → Cliente | `bancada:updated` | Status/dados de bancada alterados |
| Servidor → Cliente | `material:updated` | Material conferido ou atualizado |
| Servidor → Cliente | `activity:new` | Novo evento de atividade |
| Servidor → Cliente | `kpis:updated` | KPIs atualizados (broadcast a cada 30s) |

**Auth WS:** `io({ auth: { token: "<jwt>" } })`

## Domínio de Negócio

### Entidades principais

**Bancada** — estação de trabalho física onde um operador realiza conferências.
- Status: `ativa` | `inativa` | `conferindo` | `divergencia`
- Atividade: `digitando` | `conferindo` | `ociosa`
- Rastreia itens conferidos, total e divergências

**Material** — item físico a ser conferido em uma bancada.
- Status: `pendente` | `conferido` | `divergente`
- Divergência pode ser `sobra` (quantidade maior que esperada) ou `falta`
- Possui código, lote, validade, quantidade esperada vs. conferida

**ActivityEvent** — registro de ação ocorrida em uma bancada.
- Tipos: `conferencia` | `divergencia` | `conexao` | `desconexao` | `status`

### KPIs monitorados
- Bancadas ativas / total
- Itens conferidos / total (% de progresso)
- Taxa de divergência (%)
- Divergências pendentes
- Tempo médio de conferência
- Produtividade média (itens/hora)

---

## Autenticação e Papéis

Atualmente mock (sem backend). Sessão persiste via `localStorage` com chave `checkflow_user`.

| Papel | Email de teste | Senha |
|---|---|---|
| `admin` | admin@checkflow.com | admin123 |
| `supervisor` | supervisor@checkflow.com | super123 |
| `operator` | operador@checkflow.com | oper123 |

Rotas protegidas por `ProtectedRoute`; usuário autenticado é redirecionado para `/` ao acessar rotas públicas (`PublicRoute`).

---

## Navegação (Rotas)

| Rota | Página | Descrição |
|---|---|---|
| `/` | Index | Dashboard com KPIs, bancadas e feed |
| `/bancadas` | Bancadas | Grid de bancadas com tabs (todas/ativas/divergências) |
| `/conferencia` | Conferencia | Tabela de materiais com busca e filtros |
| `/materiais` | Materiais | Listagem de materiais |
| `/relatorios` | Relatorios | Relatórios |
| `/configuracoes` | Configuracoes | Configurações |
| `/login` | Login | Autenticação |
| `/register` | Register | Cadastro |
| `/forgot-password` | ForgotPassword | Recuperação de senha |

---

## Estado Atual

- **Frontend** completo com dados mockados em `src/data/mockData.ts` (pendente integração com backend)
- **Backend** implementado com REST API + WebSocket + Redis Pub/Sub + PostgreSQL
- Auth ainda é mock no frontend; backend já possui JWT real
- Próximo passo: integrar frontend com backend (trocar mock data por chamadas API + Socket.IO)

---

## Comandos

### Frontend
```bash
npm run dev          # Servidor de desenvolvimento (Vite) — http://localhost:5173
npm run build        # Build de produção
npm run test         # Testes unitários (Vitest)
npm run lint         # ESLint
```

### Backend
```bash
cd backend

# Desenvolvimento local (requer PostgreSQL + Redis rodando)
cp .env.example .env
npm install
npm run db:migrate   # Cria tabelas no banco
npm run db:seed      # Popula com dados de exemplo
npm run dev          # Servidor em http://localhost:3001

# Com Docker (tudo junto — 2 instâncias + Nginx + PostgreSQL + Redis)
docker compose up --build

# Utilitários
npm run db:studio    # Prisma Studio (GUI do banco)
npm run db:reset     # Reseta banco e re-seed
npm run build        # Compila TypeScript
npm start            # Inicia build compilado
```
