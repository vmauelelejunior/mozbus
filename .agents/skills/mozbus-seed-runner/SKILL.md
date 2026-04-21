---
name: mozbus-seed-runner
description: Corre o seed de dados de teste para popular a base de dados SQLite do MozBus
---

# MozBus Seed Runner

## O que faz
Popula a base de dados SQLite com dados de demonstração:
- Empresas de transporte (Nagi Bus, Panthera Azul)
- Rotas (Maputo-Beira, Maputo-Inhambane, etc.)
- Autocarros da frota
- Viagens agendadas
- Utilizadores de demonstração

## Contas de Demo
| Email | Password | Role |
|-------|----------|------|
| `admin@mozbus.mz` | `admin123` | COMPANY_ADMIN |
| `fiscal@mozbus.mz` | `fiscal123` | FISCAL |
| `passageiro@mozbus.mz` | `pass123` | PASSENGER |

## Como correr

```bash
cd C:\Users\kylec\.gemini\antigravity\scratch\mozbus-ecossistema\mozbus-backend
npx ts-node prisma/seed.ts
```

## Reset completo da BD
```bash
npx prisma migrate reset --force
npx ts-node prisma/seed.ts
```

## Verificar dados
```bash
npx prisma studio
```
Abre interface visual em `http://localhost:5555`

## Notas
- O seed é idempotente (pode correr múltiplas vezes com `upsert`)
- A base de dados está em `prisma/dev.db`
- Backup antes de reset: copiar `dev.db` para `dev.db.bak`
