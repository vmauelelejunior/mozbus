# Skill: Ultra Theme Guardian 🛡️

## Objetivo
Garantir a implementação de temas (Light/Dark Mode) no ecossistema MozBus sem comprometer a integridade funcional, performance ou estabilidade do código existente.

## Princípios de Execução

### 1. Abstração Semântica (CSS Variables)
- **NUNCA** usar cores fixas (ex: `#000`, `bg-black`) diretamente no código se elas mudarem entre temas.
- **SEMPRE** utilizar variáveis semânticas no `globals.css`:
  - `--aura-bg`: Fundo principal.
  - `--aura-surface`: Superfície de cards/modais.
  - `--aura-text`: Cor de texto primária.
  - `--aura-border`: Cor de bordas e divisores.
  - `--aura-accent`: Cor de destaque (Sky Blue).

### 2. Isolamento Funcional
- **REGRA DE OURO:** Alterações de tema **não podem** tocar em `useEffect` de busca de dados, manipuladores de formulários ou lógica de autenticação.
- O tema é controlado estritamente via atributo `data-theme` no elemento raiz (`html` ou `body`).

### 3. Preservação do Design "Ultra Absolute"
- O Light Mode não deve ser apenas "branco". Deve seguir a estética **"Frosted Snow"**:
  - Blur intenso (`backdrop-blur`).
  - Transparências suaves.
  - Sombras suaves de profundidade (soft shadows) em vez de bordas duras.

### 4. Fluxo de Verificação
1. **Definição de Tokens:** Mapear variáveis no `globals.css`.
2. **Refatoração Silenciosa:** Substituir cores fixas por variáveis em componentes-chave.
3. **Injeção de Controle:** Criar o `ThemeContext` e o botão de alternância.
4. **Auditoria de Regressão:** Verificar se o chat, as tabelas e os indicadores continuam a funcionar em ambos os modos.
