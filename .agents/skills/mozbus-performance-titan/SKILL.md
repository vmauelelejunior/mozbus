---
name: mozbus-performance-titan
description: Especialista em Performance Extrema - Lighthouse 100/100, Core Web Vitals e Micro-optimização de latência.
---

# MozBus Performance Titan

## Métricas de Ouro (Lighthouse 100)
1. **LCP (Largest Contentful Paint)**: < 1.2s
2. **FID (First Input Delay)**: < 100ms
3. **CLS (Cumulative Layout Shift)**: 0
4. **TTFB (Time to First Byte)**: < 200ms

## Protocolo Next.js (Frontend)
- **Zero Layout Shift**: Todos os containers têm tamanhos fixos ou skeletons pré-alocados.
- **Priority Loading**: Componentes críticos (Hero, Navbar) carregam antes de tudo.
- **Dynamic Imports**: Carregamento tardio de modais, gráficos e bibliotecas pesadas.
- **Asset Tapping**: Compressão agressiva de imagens e uso de formatos WebP/AVIF.

## Protocolo NestJS + Prisma (Backend)
- **Indexação Atómica**: Campos de busca frequente (phone, email, origin, destination) DEVEM ter índices na BD.
- **Selective Querying**: Nunca usar `select *`. Selecionar apenas os campos necessários para a UI.
- **Memory Caching**: Cache em memória para rotas e viagens frequentes (invalidado apenas em updates).
- **Fast Serialization**: Usar DTOs leves para reduzir o payload JSON.
