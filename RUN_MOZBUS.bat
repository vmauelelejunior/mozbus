@echo off
title MOZBUS - LANÇAMENTO DE EMERGÊNCIA
echo ==============================================
echo      🚌 MOZBUS OPERATIONAL LAUNCHER
echo ==============================================
echo.
echo Tentando executar script PowerShell...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& { $script = 'C:\Users\kylec\.gemini\antigravity\scratch\mozbus-ecossistema\emergency-rebuild.ps1'; if (Test-Path $script) { & $script } else { Write-Error 'Script nao encontrado em: '$script } }"
echo.
echo ----------------------------------------------
echo Se voce ver erros acima, copie e me mande.
echo Se nao ver nada, pressione qualquer tecla.
pause
