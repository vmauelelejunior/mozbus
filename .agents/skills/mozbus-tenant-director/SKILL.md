---
name: mozbus-tenant-director
description: Especialista em Arquitectura Multi-tenant - Separa e gere as permissões entre o CEO (SUPER_ADMIN) e as Transportadoras (COMPANY_ADMIN) no ecossistema MozBus.
---

# 👑 MozBus Tenant Director (Multi-tenant Architecture)

Esta skill orienta a implementação e manutenção do isolamento de dados e gestão hierárquica do MozBus. O objectivo é criar uma distinção perfeita entre quem **Gere a Plataforma (CEO)** e quem **Gere os Autocarros (Transportadoras)**.

## 🧬 A Separação Genética (Roles)

1.  **`SUPER_ADMIN` (O CEO / MozBus Core):**
    *   **Poderes:** Vê e gere todas as empresas. Aprova, bloqueia e ajusta as comissões das parceiras. Pode ver o panorama global ou simular a visão de uma transportadora em específico.
    *   **Restrições:** Não lhe convém criar autocarros e rotas "avulsos"—ele fá-lo, se necessário, delegando ou associando a uma `companyId`.
    *   **Sidebar Exclusiva:** Transportadoras (Companies), Relatórios Globais de Plataforma, Gestão de Comissionamento.

2.  **`COMPANY_ADMIN` (O Dono da Transportadora):**
    *   **Poderes:** Controlo total sobre o /dashboard da sua empresa (Overview, Staff, Fleet, Routes, Trips).
    *   **Restrições:** O seu JWT possui um `companyId`. Todas as suas requisições de leitura e escrita ao Backend **têm de ser trancadas/filtradas** impiedosamente por esse `companyId`. Uma transportadora NUNCA pode ver um autocarro de outra.

## 🚧 Regras de Isolamento de Backend (The Iron Wall)

Qualquer alteração nos Services (`buses`, `trips`, `routes`, `staff`) deve respeitar esta blindagem ao ler o objecto utilizador do request (`req.user`):

```typescript
// Exemplo de como um service ou controller deve ser defendido:
async findAll(user: any) {
    const whereClause: any = {};
    
    if (user.role === 'COMPANY_ADMIN') {
        if (!user.companyId) throw new Error('Transportadora sem ID de Empresa atribuído.');
        whereClause.companyId = user.companyId; // The Iron Wall
    }
    // Se for SUPER_ADMIN, a whereClause fica vazia (vê tudo)
    // ou aplica um filtro opcional se passado na query URL.

    return this.prisma.bus.findMany({ where: whereClause });
}
```

## 🏗️ Implementação no Frontend (Dashboard Inteligente)

Para não duplicar código base de painéis (não criar uma pasta `/ceo-dashboard` e outra `/company-dashboard`), usa o mesmo `/dashboard`.

### Passo A Passo da Renderização Dinâmica:

1.  **O Guarda de Interface (`DashboardSidebar`):**
    O componente que compõe os menus à esquerda tem de ler o `role` do `localStorage` (ou do Zustand store) e gerar barras de navegação distintas:

    *   *Se `SUPER_ADMIN`:* Ícones de "Painel da MozBus", "Rede de Empresas", "Comissões & Finanças Globais".
    *   *Se `COMPANY_ADMIN`:* Ícones Clássicos de "Minha Frota", "Rotas", "Fiscais", etc.

2.  **O Painel de Controlo do CEO (`/dashboard/companies`):**
    Cria uma página luxuosa e interactiva (ao nível do Titanium Performance Protocol).
    *   Deverá ser uma grid card de transportadoras.
    *   O CEO pode mudar o `status` (ACTIVE/SUSPENDED) através de modais ou toggle buttons.
    *   Ao suspender uma empresa, a UI deve reflectir imediatamente num badge a vermelho "BLOQUEADO".

3.  **Auditoria Constante (Guarda do Ponto Verde):**
    Uma empresa com status "SUSPENDIDO" não deve conseguir fazer login. O guard do JWT no Backend (`jwt.strategy` ou middleware de auth) deve ser capaz de rejeitar logins ou invalidar sessões se a `Company.status !== 'ACTIVE'`.

## 🛠️ Procedimentos de Manutenção e Testes (Workflow)

Sempre que modificares permissões com o `Tenant Director`, corre os testes de cenário:

1.  **Testar o CEO:** Entra com username `ceo` ou `admin`. Valida acesso à lista de empresas. Tenta suspender uma.
2.  **Testar Barricada:** Entra com o `COMPANY_ADMIN` da empresa suspensa. Confirma rejeição (HTTP 403 Forbidden ou erro de sessão).
3.  **Testar Isolamento (Crucial):** O `COMPANY_ADMIN` deve chamar `GET /trips` e a contagem de viagens NÃO PODE ser o número global de viagens do sistema, **apenas as da sua frota.**
