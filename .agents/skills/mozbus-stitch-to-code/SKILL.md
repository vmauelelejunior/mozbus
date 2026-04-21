---
name: mozbus-stitch-to-code
description: Skill de implementação técnica para converter designs do Stitch em código Next.js de alta fidelidade mantendo a integridade funcional.
---

# MozBus Stitch-to-Code Skill 🛠️

Esta skill orienta a implementação de designs premium gerados pelo **Stitch MCP** dentro do ecossistema **MozBus**, garantindo que a beleza visual não quebre a lógica de negócio e o plano de desenvolvimento.

## 📋 Fluxo de Implementação "Safe-High-Fidelity"

### 1. Análise de Diferenças (Diffing)
Antes de alterar o código, comparar o design do Stitch com o componente React atual:
- **Estrutura:** Quais novos elementos HTML/JSX são necessários para o visual premium?
- **Estilos:** Quais classes Tailwind ou variáveis de CSS devem ser injectadas?
- **Lógica:** Quais hooks (`useState`, `useEffect`) e chamadas de API (`api.get/post`) devem ser preservados?

### 2. Preservação de Lógica de Negócio (CRÍTICO)
**NUNCA** remover ou alterar a lógica funcional ao aplicar o design:
- Manter as importações de `api` de `@/lib/api`.
- Manter o uso de `useParams`, `useRouter` e `useSearchParams`.
- Garantir que as funções de "Confirmar", "Pagar" ou "Pesquisar" continuem conectadas aos mesmos endpoints do backend.

### 3. Injeção de Estética 10/10
Aplicar os tokens do Stitch usando Tailwind e as variáveis de `globals.css`:
- **Backgrounds:** Usar `bg-black` ou as novas camadas de `surface`.
- **Glassmorphism:** Usar a classe `.glass` definida em `globals.css` em vez de criar inline.
- **Grradients:** Usar `.hero-gradient` ou gradients inline que sigam a paleta Orange-500.
- **Framer Motion:** Envolver novos elementos em `motion.div` para manter a fluidez.

### 4. Checklist de Integridade
Após a implementação, validar:
- [ ] O componente ainda carrega dados reais do backend?
- [ ] Os botões de acção continuam funcionais?
- [ ] O layout é responsivo (mobile-first)?
- [ ] O tema "Aura Negra" (preto absoluto) foi preservado?
- [ ] O texto está em Português de Moçambique (PT-MZ)?

## 🛠️ Exemplo de Refatoração Seguro
Ao transformar uma lista simples numa lista premium:
1. Copiar as classes de estilo do HTML gerado pelo Stitch.
2. Aplicar essas classes aos elementos `map()` existentes no código React.
3. Garantir que as chaves `key={item.id}` e os eventos `onClick` permaneçam intocados.
