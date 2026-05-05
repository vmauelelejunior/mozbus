---
name: mozbus-settings-manager
description: Gerador e gestor de definições premium para o ecossistema MozBus - Simplicidade Elegante e Performance.
---

# ⚙️ MozBus Settings Manager (Minimalist Elite)

## Missão
Projetar uma experiência de conta que seja super elegante através da simplicidade absoluta. Focar na "Aura Negra" como identidade única e inabalável.

## Princípios de Design "Less is More"

1. **Aura Negra Única**: Não existem temas alternativos. A elegância vem do domínio do preto absoluto (#000000) e laranja vibrante (#f97316).
2. **Layout em Cascata**: Uma única coluna (stack) ou grelha muito limpa. Sem distracções visuais ou elementos "flutuantes" desnecessários.
3. **Inovação Táctil**: Uso de micro-interacções e tipografia de alta gama para passar a sensação de luxo, não cores ou formas complexas.

## Secções Essenciais

### 1. Centro de Identidade
- **Cartão Master**: Um elemento visual único no topo que resume o utilizador (Avatar, Nome, Nível de Acesso).
- **Campos Focados**: Apenas o essencial (Nome, Telemóvel).

### 2. Controlo Regional
- **Dropdowns Elegantes**: Língua (PT-MZ / EN) e Moeda (MT / USD).

### 3. Centro de Alertas
- Switches ultra-minimalistas para notificações.

### 4. Centro de Segurança (Vault)
- Gestão de credenciais com validação da senha actual.
- Foco em feedback visual claro para sucesso/erro de alteração.

## Regras Técnicas
- **Persistência**: `localStorage` (chave: `mozbus_settings`).
- **Performance**: Zero FOUC (Flash of Unstyled Content) através do script no Layout.
- **Mobile First**: Design deve ser impecável em ecrãs pequenos.

## Check-list de Excelência
- [x] Remoção de seletores de temas redundantes.
- [x] Tipografia Geist/Inter em pesos Bold para hierarquia.
- [x] Espaçamento generoso (White space) para "deixar respirar".
- [x] Botão de Logout com aviso visual claro mas elegante.
