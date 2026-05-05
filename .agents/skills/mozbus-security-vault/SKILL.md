---
name: mozbus-security-vault
description: Skill de elite para gestão de segurança, autenticação e integridade de dados no MozBus.
---

# 🛡️ MozBus Security Vault

## Missão
Garantir que todos os dados dos utilizadores e transações financeiras (bilhetes) estejam protegidos por padrões de criptografia de nível militar, mantendo uma UX fluida e premium.

## Padrões de Autenticação
1. **JWT (JSON Web Tokens)**: Obrigatório para todos os endpoints protegidos.
2. **Refresh Strategies**: Implementar renovação silenciosa de tokens para evitar interrupções.
3. **Roles & Permissions**: 
   - `ADMIN`: Acesso total ao ecossistema.
   - `FISCAL`: Acesso a rotas e validação de bilhetes.
   - `PASSENGER`: Acesso a "Meus Bilhetes" e definições pessoais.

## Protocolo de Alteração de Credenciais
1. **Verificação Dupla**: Sempre exigir a palavra-passe actual antes de permitir a alteração.
2. **Salt Rounds**: Uso de `bcrypt` com no mínimo 12 rounds no backend.
3. **Feedback Visual**: No frontend, usar `AnimatePresence` e cores semânticas (Red/Green) com o estilo Aura Negra.

## Segurança de Dados Sensíveis
- **LocalStorage**: Nunca guardar palavras-passe em plain text. Apenas o JWT e metadados básicos do utilizador.
- **Camada API**: Todo o tráfego deve ser interceptado pelo `api.ts` para injectar o Bearer Token.

## Check-list de Auditoria
- [ ] Pontos finais sensíveis estão protegidos com `@UseGuards(JwtAuthGuard)`.
- [ ] Senhas no banco de dados estão devidamente hasheadas.
- [ ] Erros de autenticação retornam mensagens PT-MZ amigáveis, sem expor detalhes técnicos.
