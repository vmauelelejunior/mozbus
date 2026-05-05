# 🚌 MozBus Ultra Launch (ASCII Edition - No Emojis)
$ErrorActionPreference = "Continue"

Write-Host "--- INICIANDO CENTRAL MOZBUS COM DEEPSEEK ---" -ForegroundColor Cyan

# 1. Limpeza
Write-Host "Limpando processos antigos..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
taskkill /F /IM npm.exe 2>$null
Start-Sleep -Seconds 2

# 2. Setup Backend
$backendPath = "C:\Users\kylec\.gemini\antigravity\scratch\mozbus-ecossistema\mozbus-backend"
Set-Location $backendPath
Write-Host "Configurando Backend..."
npx prisma generate
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev"

# 3. Setup Frontend & DeepSeek
$frontendPath = "C:\Users\kylec\.gemini\antigravity\scratch\mozbus-ecossistema\mozbus-web"
Set-Location $frontendPath

Write-Host "Garantindo suporte ao DeepSeek..." -ForegroundColor Cyan
npm install @ai-sdk/openai --no-save

Write-Host "Abrindo navegador em http://localhost:3000"
Start-Process "http://localhost:3000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "PRONTO! Use DEEPSEEK_API_KEY no seu .env" -ForegroundColor Green
