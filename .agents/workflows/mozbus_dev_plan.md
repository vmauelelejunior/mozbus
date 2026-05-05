---
description: Plano de desenvolvimento MozBus - continuação do projecto do ponto em que parou
---

# 🚌 MozBus — Plano de Desenvolvimento Continuado

## REGRAS DE EXCELÊNCIA 10/10
- Design: dark premium, orange-500, glassmorphism, Framer Motion obrigatórios
- Língua: PT-MZ em todos os labels, erros e mensagens
- Código: TypeScript estrito, sem `any` desnecessário
- Segurança: JWT Guards em todos os endpoints protegidos
- UX: Feedback visual para todos os estados (loading, erro, sucesso)
- Mobile-first: validar responsividade em todas as páginas

## FASE 1 — CORRECÇÕES CRÍTICAS (Blocking Issues)

### Fase 1.1 — Corrigir Porta do Backend
- Editar `mozbus-backend/.env` e garantir `PORT=3333`
- Verificar que `mozbus-web/src/lib/api.ts` aponta para `http://localhost:3333`

### Fase 1.2 — Implementar JWT Guards no Backend
- Criar `JwtAuthGuard` em `src/auth/jwt.guard.ts`
- Criar `JwtStrategy` em `src/auth/jwt.strategy.ts`
- Proteger endpoints: `/trips` (POST), `/tickets/book`, `/tickets/scan`
- Endpoints públicos: `/auth/login`, `/auth/register`, `/trips/search`, `/trips/:id` (GET)

### Fase 1.3 — Dashboard com Auth Real
- Ler `mozbus_user` do `localStorage` no `dashboard/layout.tsx`
- Implementar botão "Sair" (limpar localStorage + redirect `/`)
- Mostrar nome e role real do utilizador autenticado

## FASE 2 — FUNCIONALIDADES EM FALTA

### Fase 2.1 — Página `/dashboard/staff` (Gestão de Fiscais)
- Listar todos os utilizadores com role `FISCAL`
- Atribuir fiscal a um autocarro
- Criar novo fiscal (form com nome, email, telefone)
- Design consistente com o resto do dashboard

### Fase 2.2 — Área do Passageiro "Meus Bilhetes"
- Nova página `/tickets/meus-bilhetes`
- Listar bilhetes do utilizador autenticado (via JWT)
- Mostrar QR code de cada bilhete
- Status visual: PAGO, EMBARCADO, CANCELADO
- Adicionar link no navbar para utilizadores PASSENGER

### Fase 2.3 — Real-time no Fiscal (Polling)
- Adicionar polling de 5s em `fiscal/page.tsx` para re-fetch da lista de passageiros
- Indicador visual de "Ao Vivo" (ponto pulsante verde)

## FASE 3 — POLISH E MELHORIAS

### Fase 3.1 — Settings Page
- [x] Criar página `/settings`
- [x] Permitir alterar nome e password do utilizador
- [x] Implementar design Aura Negra premium
- [x] Fase 3.1: Implementar página de definições (/settings) (Concluído)
- [x] Fase 3.2: Limpeza de pastas residuais (Concluído)
- [x] Fase 3.3: Migração para SQLite local e Seed de dados (Concluído)
- [x] Fase 3.4: Testes de integração de definições (Concluído)

## Fase 4: Notificações e UX 10/10
- [ ] Fase 4.1: Sistema de notificações em tempo real (Toast/Snackbars)
- [ ] Fase 4.2: Loading states premium (Skeletons Aura Negra)
- [ ] Fase 4.3: Feedback táctil e micro-animações em toda a app

## SKILLS A CRIAR

### skill: mozbus-backend-runner
Descrição: Iniciar o backend NestJS do MozBus em modo dev

### skill: mozbus-frontend-runner
Descrição: Iniciar o frontend Next.js do MozBus em modo dev

### skill: mozbus-fullstack-runner
Descrição: Iniciar backend + frontend em paralelo

### skill: mozbus-seed
Descrição: Correr o seed de dados no SQLite
