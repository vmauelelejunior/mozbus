---
name: mozbus-backend-runner
description: Inicia o backend NestJS do MozBus em modo desenvolvimento na porta 3333
---

# MozBus Backend Runner

## Pré-requisitos
- Node.js instalado
- Dependências instaladas (`npm install` em `mozbus-backend/`)
- Ficheiro `.env` com `DATABASE_URL` e `JWT_SECRET` configurados

## Como usar

Navegar para a pasta do backend e iniciar:

```bash
cd C:\Users\kylec\.gemini\antigravity\scratch\mozbus-ecossistema\mozbus-backend
npm run start:dev
```

## O que esperar
- Backend disponível em: `http://localhost:3333`
- Swagger disponível em: `http://localhost:3333/api/docs`
- Modo watch: re-compila automaticamente ao salvar ficheiros

## Verificação de saúde
```bash
curl http://localhost:3333
```

## Notas
- A porta é definida no `.env` como `PORT=3333`
- Base de dados SQLite em `prisma/dev.db`
- JWT_SECRET deve coincidir entre backend e tokens emitidos
