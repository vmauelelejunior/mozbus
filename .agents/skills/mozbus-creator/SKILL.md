---
name: mozbus-creator
description: Skill de elite para criar e adaptar outras skills, garantindo a resiliência total do ecossistema MozBus. Resolve interrupções de execução e falhas de ambiente.
---

# 🛠️ MozBus Creator Skill (Auto-Resilience)

Esta skill é a "mãe de todas as skills". O seu propósito é detetar o que impede o MozBus de rodar e criar soluções dinâmicas.

## 🚀 Diagnóstico de Interrupção

Sempre que a página não carregar, executa este script de "Criação de Soluções":

```powershell
# Script: solve-mozbus.ps1
Write-Host "🔍 Analisando interrupções no MozBus..." -ForegroundColor Cyan

# 1. Verificar Portas
$b = netstat -ano | findstr :3333
$f = netstat -ano | findstr :3000

if ($b) { Write-Host "✅ Backend detectado." -ForegroundColor Green } 
else { 
    Write-Host "❌ Backend desligado. Iniciando..." -ForegroundColor Yellow
    cd mozbus-backend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev"
}

if ($f) { Write-Host "✅ Frontend detectado." -ForegroundColor Green }
else {
    Write-Host "❌ Frontend desligado. Iniciando..." -ForegroundColor Yellow
    cd mozbus-web
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
}

# 2. Verificação de Integridade (Prisma)
cd mozbus-backend
if (!(Test-Path "prisma/dev.db")) {
    Write-Host "⚠️ Base de dados ausente. Criando..." -ForegroundColor Cyan
    npx prisma db push
}

# 3. Verificação de Autenticação
node fix-passwords.js
```

## 🧠 Habilidades Criadas / Adaptadas

| Skill | Adaptação para Resiliência |
|-------|-----------------------------|
| `mozbus-frontend-runner` | Adicionada verificação de `node_modules`. |
| `mozbus-backend-runner` | Adicionada verificação automática de `.env`. |
| `mozbus-tester` | Adicionado teste de integridade de JWT. |

## 🛠️ Comando Mestre (O "Creator")

Se precisares de "Criar" o ambiente do zero num estado saudável, roda:

```powershell
# Cria o script de emergência
@'
   # Mata processos antigos
   taskkill /F /IM node.exe 2>$null
   
   # Backend
   cd mozbus-backend
   npm install
   npx prisma generate
   node fix-passwords.js
   Start-Process powershell -ArgumentList "-Command", "npm run start:dev"
   
   # Frontend
   cd ../mozbus-web
   npm install
   Start-Process powershell -ArgumentList "-Command", "npm run dev"
'@ | Out-File -FilePath "C:\Users\kylec\.gemini\antigravity\scratch\mozbus-ecossistema\emergency-rebuild.ps1"

# Executa
powershell -ExecutionPolicy Bypass -File .\emergency-rebuild.ps1
```
