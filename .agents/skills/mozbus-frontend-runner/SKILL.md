---
name: mozbus-frontend-runner
description: Inicia o frontend Next.js do MozBus em modo desenvolvimento na porta 3000
---

# MozBus Frontend Runner

## Pré-requisitos
- Node.js instalado
- Dependências instaladas (`npm install` em `mozbus-web/`)
- Backend activo em `http://localhost:3333`

## Como usar

```bash
cd C:\Users\kylec\.gemini\antigravity\scratch\mozbus-ecossistema\mozbus-web
npm run dev
```

## O que esperar
- Frontend disponível em: `http://localhost:3000`
- Hot reload activo

## Páginas principais
| Rota | Descrição |
|------|-----------|
| `/` | Homepage com busca de viagens |
| `/auth/login` | Login |
| `/auth/register` | Registo |
| `/trips/results` | Resultados de busca |
| `/trips/seats` | Mapa de assentos |
| `/fiscal` | Scanner QR Fiscal |
| `/dashboard/overview` | Painel empresa |
| `/dashboard/trips` | Agendador de viagens |
| `/dashboard/staff` | Gestão de fiscais |

## Nota sobre AGENTS.md
Este projecto tem um `AGENTS.md` em `mozbus-web/` com a regra:
> Ler o guia em `node_modules/next/dist/docs/` antes de escrever qualquer código Next.js.
