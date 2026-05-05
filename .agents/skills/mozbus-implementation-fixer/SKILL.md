---
name: mozbus-implementation-fixer
description: Skill de elite para garantir que modificações de código são efectivamente aplicadas e visíveis no UI do MozBus.
---

# MozBus Implementation & Fixer Skill

## Missão
Garantir que 100% das alterações de código (CSS, TSX, Configs) são traduzidas em mudanças visíveis para o utilizador final, eliminando problemas de cache, compilação ou seletores CSS.

## Protocolo de Verificação (Ajustes)
1.  **Validação de Seletor**: Sempre que adicionar um tema ou estilo, verificar se o seletor CSS (ex: `data-theme`) coincide exactamente com o que o JavaScript está a injectar.
2.  **Forçar Compilação**: Se uma alteração não aparecer, apagar a pasta `.next` local e reiniciar o servidor para forçar o Next.js a reconstruir o site do zero.
3.  **Inspecção Visual**: Usar ferramentas de automação para ler o DOM e confirmar se as classes e atributos novos estão presentes no HTML gerado.

## Resolução de "Não Aparece"
- **Passo A**: Verificar logs de erro em tempo real (`npm run dev`).
- **Passo B**: Limpar `localStorage` e cookies se a lógica depender de estados persistentes.
- **Passo C**: Verificar se o ficheiro editado está a ser importado pelo componente pai.

## Padrões de Ajuste Premium
- Todas as margens e paddings devem seguir a escala de 4/8px.
- Transições de tema devem ter `duration-300` e `ease-in-out`.
- Elementos interactivos devem ter feedback visual (hover/active).
