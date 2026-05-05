---
name: mozbus-design-chat-manager
description: Regras de preservação do design escuro original (sem temas light) e gestão do Chat Support AI
---

# MozBus Design & Chat Manager

## Requisito 1: Preservação do Design

Ao longo do desenvolvimento contínuo da aplicação MozBus Connect, foi estabelecido pelo utilizador que o **design original deve ser preservado**.

*   **Tema:** O sistema utiliza exclusivamente um tema negro customizado. Ficam totalmente abolidas as tentativas de criar scripts de transição para temas \`light\` ou injeções de alteração de background (ex. \`data-theme='light'\`).
*   **\`globals.css\`:** As variáveis \`--background\` e \`--foreground\` no :root devem permanecer inalteradas (ex: \`--background: #000000;\`). O efeito Glassmorphism da classe \`.glass\` deve ser mantido como o original com cores sombrias/translúcidas.
*   **\`layout.tsx\`:** O ficheiro deve manter-se flexível mas fixo no design de fundos nativos, não adicionando scripts intrusivos de theme switching no \`<head>\`.

## Requisito 2: Funcionalidade do Chat Support

Foi integrado o componente \`ChatSupport\` animado (que reside em \`src/components/ChatSupport.tsx\`) de forma global no projecto \`layout.tsx\`.

Para manter ou modificar o Chat:
*   A API backend oficial localiza-se em \`src/app/api/chat/route.ts\`.
*   A integração utiliza as bibliotecas: \`@ai-sdk/react\` e \`@ai-sdk/google\`. É proibido importar hooks antigos de \`ai/react\` para evitar que o Next.js falhe na compilação.
*   Tratamento de estado \`input\`: Quando utilizar o hook \`useChat()\`, garantir acesso a propriedades como o \`input\` de forma resiliente a falsos valores ou nulls no SSR / Client Side Rendering inicialmente (ex: \`value={input || ''}\`).
*   O modelo gemini preferencial a utilizar na route API \`/api/chat\` é localmente suportado pelo endpoint da Vercel AI (seja \`gemini-2.5-flash\` ou correspondente). A \`GEMINI_API_KEY\` deverá constar no ambiente local (\`.env.local\`).

## Executando as Aplicações
Se alguma regressão ou conflito css/ui se detetar:
\`\`\`bash
# Limpar as caches Next.js, se for necessário para garantir layouts limpos
Remove-Item -Recurse -Force .next
npm run dev
\`\`\`
