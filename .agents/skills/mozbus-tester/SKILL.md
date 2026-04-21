---
name: mozbus-tester
description: Skills para preparar e testar o ambiente MozBus - corrige passwords, inicia serviços, valida credenciais
---

# MozBus Tester Skill

## Como usar esta skill

Esta skill prepara o ambiente MozBus para testes, garantindo que:
1. As passwords estão em hash (bcrypt)
2. O backend está a correr
3. As credenciais funcionam

## ⚠️ Setup Inicial (primeira vez)

### Passo 1: Verificar/Kill processos nas portas 3333 e 3000
```powershell
netstat -ano | findstr :3333
netstat -ano | findstr :3000
```

### Passo 2: Corrigir passwords (se necessário)
```node
cd mozbus-backend
node fix-passwords.js
```

### Passo 3: Iniciar Backend
```powershell
cd mozbus-backend
npm run start:dev
```
O backend deve mostrar: `🚀 MozBus Backend rodando em: http://localhost:3333`

### Passo 4: Iniciar Frontend (outro terminal)
```powershell
cd mozbus-web
npm run dev
```

## Credenciais de Teste (Funcionais!)

| Email | Password | Role | Dashboard |
|-------|----------|------|-----------|
| passageiro@mozbus.mz | passageiro123 | PASSENGER | /tickets/meus-bilhetes |
| gestor@nagibus.mz | gestor123 | COMPANY_ADMIN | /dashboard/overview |
| fiscal@nagibus.mz | fiscal123 | FISCAL | /fiscal |
| admin@mozbus.mz | admin123 | SUPER_ADMIN | /dashboard/overview |

## Fluxo de Teste (via navegador)

### Teste 1: Comprar bilhete (Passageiro)
1. Ir para `http://localhost:3000`
2. Clicar "Entrar"
3. Login: `passageiro@mozbus.mz` / `passageiro123`
4. Pesquisar: Maputo → Beira
5. Escolher viagem e assento
6. Confirmar reserva
7. Ver em: `/tickets/meus-bilhetes`

### Teste 2: Criar viagem (Gestor)
1. Login: `gestor@nagibus.mz` / `gestor123`
2. Ir para `/dashboard/trips`
3. Clicar "Nova Partida"
4. Preencher: rota, autocarro, data, preço
5. Confirmar criar

### Teste 3: Validar bilhete (Fiscal)
1. Login: `fiscal@nagibus.mz` / `fiscal123`
2. Ir para `/fiscal`
3. Selecionar viagem
4. Inserir código QR ou usar scan manual

## Verificação via API (PowerShell)

### Testar Login
```powershell
Invoke-RestMethod -Uri "http://localhost:3333/auth/login" -Method Post -Body (@{email="passageiro@mozbus.mz"; password="passageiro123"} | ConvertTo-Json) -ContentType "application/json"
```
Resposta(expected): `{"access_token":"eyJ...","user":{...}}`

### Buscar viagens
```powershell
Invoke-RestMethod -Uri "http://localhost:3333/trips/search?origin=Maputo&destination=Beira"
```

### Listar utilizadores
```powershell
Invoke-RestMethod -Uri "http://localhost:3333/users"
```

## Problemas e Soluções

### Problema: "Credenciais inválidas"
**Solução:** Executar script de correção:
```node
cd mozbus-backend
node fix-passwords.js
```

### Problema: Backend não inicia (porta em uso)
```powershell
netstat -ano | findstr :3333
# Identificar PID e matar
taskkill /PID <PID> /F
# Reiniciar
npm run start:dev
```

### Problema: Frontend mostra "Erro de conexão"
- Verificar que backend está na porta 3333
- Verificar `mozbus-web/src/lib/api.ts` -> `baseURL: 'http://localhost:3333'`

## Quick Fix (Tudo de uma vez)

Se algo não estiver a funcionar:
```powershell
# Terminal 1: Backend
cd mozbus-backend
node fix-passwords.js
npm run start:dev

# Terminal 2: Frontend  
cd mozbus-web
npm run dev
```

Aceder: `http://localhost:3000`