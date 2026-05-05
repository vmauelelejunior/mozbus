# MozBus Precision Protocol (Memory & Integrity)

Este protocolo foi criado para garantir que o Agente Antigravity mantenha a precisão absoluta de "Elite" exigida pelo utilizador Mauelele Junior no ecossistema MozBus.

## 🧠 Regras de Memória de Estado
1.  **Inventário de Estados:** Antes de usar `replace_file_content` ou `write_to_file`, DEVES listar mentalmente todas as variáveis de estado (`useState`) e referências (`useRef`) existentes no componente.
2.  **Regra da Não-Exclusão:** É TERMINANTEMENTE PROIBIDO remover variáveis de estado (`viewMode`, `busPos`, `eta`, etc.) a menos que seja explicitamente solicitado. Mesmo que estejas a focar numa nova funcionalidade, os estados anteriores devem ser preservados.
3.  **Checklist de Integridade:**
    - O `viewMode` ainda está lá?
    - As coordenadas `busPos` e `destination` foram mantidas?
    - Os `importLibrary` da Google estão completos?

## 🚀 Padrões Google Maps (Elite 2026)
- **API Funcional:** NUNCA usar `new Loader()`. Usar sempre `setOptions` e `importLibrary`.
- **Visibilidade de Rota:** Sempre garantir que o `strokeWeight` da rota seja visível (mínimo 6) e que o `mapTypeId` suporte 'hybrid'.
- **ETA & Distância:** Sempre extrair `duration.text` e `distance.text` da `Directions API` para alimentar o UI.

## 🛠️ Prevenção de Erros de Ferramenta
- **Contexto Completo:** Ao usar `replace_file_content`, garante que o `TargetContent` e o `ReplacementContent` incluem as linhas de contexto necessárias para não "quebrar" o código ao redor.
- **NUNCA usar `// ...`** dentro de blocos de substituição. O código deve ser completo e funcional.

## 💎 Estética MozBus
- Manter o design escuro, premium, com bordas arredondadas (`rounded-[40px]`), sombras profundas e micro-animações (Framer Motion).

---
**ASSINATURA DE COMPROMISSO:**
"A precisão é o nosso GPS. A memória é a nossa rota. A elite é o nosso destino."
