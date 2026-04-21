---
name: mozbus-scenario-planter
description: Especialista em arquitetura de dados e cenários de teste para o MozBus. Gera ecossistemas completos com múltiplas empresas, frotas diversificadas e simulação de vida operacional real.
---

# MozBus Scenario Planter 🎭

Esta skill é responsável por injetar "vida" no ecossistema MozBus, permitindo testes de alta fidelidade em todos os setores (Admin, Frota, Bilheteira e Fiscal).

## Capacidades
- **Multi-Empresa:** Simula 5 transportadoras distintas (Nagi Bus, Panthera Azul, etc.)
- **Frotas Realistas:** Gera veículos com diferentes capacidades (Sprinters, Yutongs, Marcopolos) e estados (Ativo, Manutenção).
- **Rede Nacional:** Cobre rotas em todo o território moçambicano.
- **Estados de Viagem:** Simula o ciclo de vida completo (Passado, Presente e Futuro).
- **Manifestos Dinâmicos:** Popula bilhetes vendidos com QR codes e números de assento.

## Como Executar

Para plantar todos os cenários na base de dados SQLite:

```bash
cd C:\Users\kylec\.gemini\antigravity\scratch\mozbus-ecossistema\mozbus-backend
npx ts-node prisma/seed_scenarios.ts
```

## Contas Geradas (Senha padrão: `mozbus123`)

| Perfil | Email Exemplo | Função |
|--------|---------------|--------|
| **Super Admin** | `ceo@mozbus.mz` | Gestão Total do Ecossistema |
| **Gestor** | `gestor1@nagibus.mz` | Gestor da Transportadora |
| **Fiscal** | `fiscal1@mozbus.mz` | Agente de Embarque |
| **Passageiro** | `passageiro1@gmail.com` | Cliente Premium |

## Quando usar esta Skill:
- Antes de demonstrações para o cliente.
- Para testar lógicas de analytics no dashboard.
- Para validar o scanner de QR code com bilhetes "reais".
- Após um reset na base de dados (`npx prisma migrate reset`).

---
*"Transformando base de dados vazias em operações de transporte vibrantes."*
