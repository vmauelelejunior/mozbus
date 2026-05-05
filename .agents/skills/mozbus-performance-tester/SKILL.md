---
name: mozbus-performance-tester
description: Skill de auditoria e otimização extrema de performance (Lighthouse 100/100). Executa testes, analisa gargalos e aplica micro-otimizações.
---

# 🚀 MozBus Performance Tester (Titan Protocol)

Esta skill define o protocolo de testes de performance e as heurísticas de otimização para elevar o MozBus à categoria Elite Mundial (Lighthouse 100/100).

## 🛠️ Passo 1: Execução do Teste de Auto-Avaliação (Browser/Lighthouse)

Para validar a performance real, esta skill indica o uso do **Google Lighthouse**. 
A execução pode ser feita diretamente no backend via terminal usando as ferramentas Lighthouse CLI ou usando o Subagente de Navegação (Browser Subagent) para reportar atrasos visuais reais.

### Comando Lighthouse CLI:
```bash
npx lighthouse http://localhost:3000 --view --output html --output-path ./lighthouse-report.html --chrome-flags="--headless"
```
*(Certifique-se de que o frontend e o backend estão a correr antes de iniciar a auditoria)*

### Métricas de Foco (Web Vitals Elite):
- **LCP (Largest Contentful Paint)**: Meta < 1.2s
- **CLS (Cumulative Layout Shift)**: Meta 0.00
- **TBT (Total Blocking Time)**: Meta < 50ms
- **SI (Speed Index)**: Meta < 1.5s

---

## ⚙️ Passo 2: Diagnóstico e Resolução de Anomalias (Ajustes Titan)

Baseado nos resultados do Lighthouse, aplique os seguintes *Ajustes Titan*:

### 1. Eliminação de Recursos Bloqueadores de Renderização (Render-Blocking Resources)
- **Causa Comum**: CSS síncrono enorme, scripts não críticos na `<head>`.
- **Ajuste Titan**: 
  - Mova scripts de terceiros (como Google Analytics, Chat) para a parte inferior do `<body>` ou utilize `next/dynamic` (já implementado no ChatSupport).
  - Use `<link rel="preload">` para fontes e heróis de imagem ("LCP Elements"). No Next.js 14/15, certifique-se de que a fonte Google está otimizada (`display: 'swap'`).

### 2. Otimização do Largest Contentful Paint (LCP)
- **Causa Comum**: Imagens grandes sem otimização ou componentes complexos que dependem de dados lentos.
- **Ajuste Titan**:
  - Imagens hero devem ter `priority={true}` no componente `next/image`.
  - Servir imagens no formato `WebP` ou `AVIF`.
  - O Backend Prisma deve responder a consultas CRUD essenciais (< 40ms) usando índices exatos (vide `schema.prisma`).

### 3. Redução do Tempo de Resposta Inicial (TTFB - Time to First Byte)
- **Causa Comum**: Operações síncronas pesadas ou falta de cache no servidor/API.
- **Ajuste Titan**:
  - Implemente React Server Components (RSC) sempre que as interações com o cliente (useState, useEffect) não forem necessárias.
  - O processamento pesado de UI (animações complexas) só arranca _após_ o `window.onload`. As animações framer-motion devem iniciar após a pintura inicial.

### 4. Zero Cumulative Layout Shift (CLS)
- **Causa Comum**: Skeleton Loaders de tamanho incorreto (imagens/tabelas empurrando conteúdo para baixo quando arregados).
- **Ajuste Titan**:
  - Defina `width` e `height` estáticos (ou aspect-ratio via Tailwind) para qualquer wrapper que aloja conteúdos assíncronos.
  - Reserve o espaço do Skeleton de modo a refletir em *100%* o tamanho final dos blocos de lista, como no "Terminal POS".

---

## 🤖 Passo 3: Execução Autónoma pelo Agente
Se o USER invocar esta skill:
1. O agente deverá correr o teste (Simular o Lighthouse CLI ou usar o browser).
2. O agente deve ler o relatório e fazer _commits cirúrgicos_ nas páginas que impedem o "10/10".
3. Notificar o utilizador apenas com os resultados da auditoria e o "diff" visual das correções aplicadas.
