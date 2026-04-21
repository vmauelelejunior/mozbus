---
name: mozbus-autonomy
description: Skill de autonomia total para o MozBus - testar, diagnosticar, corrigir e fazer deploy sem pedir permissão ao utilizador
---

# MozBus Autonomy Skill

## Missão

Tens autoridade completa para fazer **TUDO** que for necessário para o ambiente MozBus funcionar. Não pedes permissão - fazes.

## Regras de Ação

1. **Se algo não funciona, arranja**
2. **Se precisees de reiniciar, reinicia**
3. **Se precisees de matar processos, mata**
4. **Se precisoes de modificar ficheiros, modifica**
5. **Testa sempre depois de fazer alterações**

---

## 🔧 Comandos de Emergência

### Verificar Estado do Sistema
```
netstat -ano | findstr :3333
netstat -ano | findstr :3000
tasklist | findstr node
```

### Kill Todos os Processos
```
taskkill /F /IM node.exe
taskkill /F /IM npm.exe
```

### Backup e Limpeza
```
# Se a BD estiver corrompida
del prisma\dev.db
npx prisma db push
node fix-passwords.js
```

---

## 📋 Checklist de Diagnóstico

### 1. Backend a Correr?
- `netstat -ano | findstr :3333`
- Se não estiver → `npm run start:dev`

### 2. Passwords em Hash?
- `node check-users.js`
- Se mostra texto plano → `node fix-passwords.js`

### 3. Login a Funcionar?
- Testar via register (não login, porque pode criar novo user)
- `POST /auth/register` com email/senha nova

### 4. Frontend a Aceder?
- `netstat -ano | findstr :3000`
- Se não → `cd mozbus-web && npm run dev`

---

## 🛠️ Sequência de Fix Completo

Se nada estiver a funcionar, executa esta sequência:

```powershell
# 1. Mata tudo
taskkill /F /IM node.exe 2>$null

# 2. Entra no backend  
cd mozbus-backend

# 3. Verifica BD
npx prisma db push

# 4. Corrige passwords
node fix-passwords.js

# 5. Inicia backend (em background)
Start-Process powershell -ArgumentList "-Command", "npm run start:dev"

# 6. Espera 5 segundos
Start-Sleep -Seconds 5

# 7. Testa register (cria novo user)
# Se register funcionar = auth OK
```

---

## 🎯 Teste Automático

Creates um script de teste que:
1. Tenta registar novo utilizador
2. Se register falha → mostra erro exato
3. Se register OK → tenta login
4. Mostra tokens e IDs

### Script de Teste Automático
```javascript
const http = require('http');

function test( caminho, dados ) {
  return new Promise( (resolve, reject) => {
    const body = dados ? JSON.stringify(dados) : '';
    const op = dados ? 'POST' : 'GET';
    const req = http.request({
      hostname: 'localhost', port: 3333, 
      path: caminho, method: op,
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', e => reject(e));
    if(body) req.write(body);
    req.end();
  });
}

async function run() {
  console.log('=== TESTE AUTÓNOMO ===');
  
  // Teste 1: Register (cria novo user)
  const rand = Math.random().toString(36).substring(7);
  const email = `test${rand}@mozbus.mz`;
  console.log('Testando register:', email);
  
  try {
    const r1 = await test('/auth/register', { 
      email, password: 'test123', name: 'Test', phone: '840000000' 
    });
    console.log('Register:', r1.status, r1.body);
    
    if(r1.status === 201) {
      const token = JSON.parse(r1.body).access_token;
      console.log('✅ SUCESSO! Token:', token?.substring(0,20), '...');
    }
  } catch(e) {
    console.log('❌ ERRO:', e.message);
  }
}

run();
```

---

## 🔄 Autosetup Completo

Creates um único comando que faz TUDO:
```powershell
function MozBus-Setup {
  Write-Host "🚌 MozBus Autosetup..." -ForegroundColor Cyan
  
  # Kill all
  taskkill /F /IM node.exe 2>$null | Out-Null
  Start-Sleep -Seconds 2
  
  # Backend
  cd mozbus-backend
  node fix-passwords.js
  Start-Process -FilePath "npm" -ArgumentList "run start:dev" -NoNewWindow
  
  Start-Sleep -Seconds 8
  
  # Frontend  
  cd ../mozbus-web
  Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow
  
  Write-Host "✅ Autosetup completo!" -ForegroundColor Green
  Write-Host "Acede: http://localhost:3000" -ForegroundColor Yellow
}

# Para executar:
# MozBus-Setup
```

---

## 🚀 Como Usar Esta Skill

1. **Executa o diagnóstico primeiro**
2. **Se encontrar problema → corrige imediatamente**
3. **Não pedes confirmação**
4. **Testas depois de corrigir**
5. **Se ainda não funcionar → repetes**

---

## 💡 Prioridades de Ação

| Prioridade | Ação |
|----------|------|
| 🔴 CRÍTICO | Backend na porta 3333 |
| 🔴 CRÍTICO | Passwords em hash |
| 🟠 URGENTE | Frontend na porta 3000 |
| 🟡 IMPORTANTE | Seed executado |
| 🟢 nice-to-have | Dados de teste existen |

---

## 📝 Notas para Autonomia

- Se o erro for "porta em uso" → kill o processo
- Se "credenciais inválidas" → executar fix-passwords.js
- Se "não conecta" → verificar firewall/antivirus
- Se Prisma error → npx prisma generate
- Se timeout → reiniciar tudo

**Tens Full Autonomy. FAZ ACONTECER.**