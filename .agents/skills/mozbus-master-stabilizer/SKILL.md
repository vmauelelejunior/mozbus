# MozBus Master Stabilizer Protocol

Este protocolo define os padrões de elite para a reparação e estabilização total do ecossistema MozBus.

## 1. Parâmetros de Design "Elite Mundial"
*   **Background:** Sempre `#0B0B0F` (Midnight Carbon).
*   **Contentores:** `rounded-[3rem]` (48px) para cartões e modais.
*   **Espaçamento:** Mínimo `p-10` ou `p-12` para secções principais. Nada deve parecer apertado.
*   **Tipografia:** 
    *   Headers: `text-5xl` ou `text-6xl`, `font-black`, `italic`, `tracking-tighter`.
    *   Labels: `text-[10px]`, `font-black`, `uppercase`, `tracking-[0.4em]`, `opacity-30`.
*   **Aceleração:** Uso obrigatório de `framer-motion` para entradas suaves (`initial={{ opacity: 0, y: 20 }}`).

## 2. Blindagem Técnica (Anti-Erro)
*   **Importações Obrigatórias:**
    *   `EliteLoader` de `@/components/EliteLoader`.
    *   `api` de `@/lib/api`.
    *   Lista completa de ícones do `lucide-react`.
*   **Proteção DOM:** Atributos `notranslate` e `translate="no"` na div raiz de cada página.
*   **Null-Safety:** Uso de optional chaining (`?.`) em todos os dados vindos da API (ex: `trip.route?.origin`).
*   **Inputs de Elite:** Altura mínima `h-20` ou `p-6` para campos de texto, com `rounded-2xl` ou `rounded-[2rem]`.

## 3. Checklist de Varredura
- [ ] Verificar `EliteLoader` (importação e uso).
- [ ] Verificar ícones do `lucide-react` (erros de referência).
- [ ] Aplicar `notranslate` na div pai.
- [ ] Substituir todos os `fetch` por `api`.
- [ ] Ajustar escala visual (Paddings e Radii).
