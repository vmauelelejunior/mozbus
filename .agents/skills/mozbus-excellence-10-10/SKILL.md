---
name: mozbus-excellence-10-10
description: Regras de excelência 10/10 para desenvolvimento no projecto MozBus - design, código e UX
---

# MozBus — Regras de Excelência 10/10

## 🎨 Design System

### Paleta de Cores
```css
--color-bg-primary: #050505;       /* Fundo página pública */
--color-bg-dashboard: #020617;     /* Fundo dashboard */
--color-brand: #f97316;            /* Orange-500 — cor principal */
--color-brand-hover: #fb923c;      /* Orange-400 — hover */
--color-glass: rgba(255,255,255,0.05); /* Glassmorphism base */
```

### Componentes Obrigatórios
- **Glassmorphism** em cards: `bg-white/5 border border-white/10 backdrop-blur`
- **Framer Motion** para: entradas de página, modais, hover effects
- **Lucide React** para todos os ícones
- **Rounded corners**: `rounded-2xl` (cards pequenos), `rounded-[32px]` (cards grandes), `rounded-[40px]` (hero cards)

### Tipografia
- Font: sistema TailwindCSS
- Títulos: `font-black tracking-tighter uppercase`
- Labels: `text-[10px] font-black uppercase tracking-widest opacity-40`
- Corpo: `font-semibold`

### Animações
```tsx
// Entrada padrão de página
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

// Hover em cards
whileHover={{ x: 10 }} // ou scale: 1.02

// Botão principal
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

## 💻 Código

### TypeScript
- Usar tipos explícitos sempre que possível
- Evitar `any` — usar interfaces/types específicos
- Usar `unknown` em vez de `any` para dados externos

### NestJS Backend
- Todos os DTOs com class-validator decorators
- Endpoints protegidos com `@UseGuards(JwtAuthGuard)`
- Respostas de erro consistentes com `HttpException`
- Transacções atómicas para operações multi-tabela

### Next.js Frontend
- `"use client"` apenas quando necessário (interactividade)
- Ler `AGENTS.md` antes de escrever código Next.js
- API calls centralizadas via `src/lib/api.ts` (axios + JWT interceptor)
- Feedback visual: loading states, error states, success states

## 🌍 Localização
- Língua: **Português de Moçambique (PT-MZ)**
- Data/hora: `toLocaleString('pt-MZ')`
- Moeda: `MT` (Meticais)
- Formatos de telefone: +258 XX XXX XXXX

## 🔐 Segurança
- JWT em `localStorage` com keys: `mozbus_token`, `mozbus_user`
- Todos os endpoints sensíveis protegidos com Bearer JWT
- Roles verificadas no frontend: `PASSENGER`, `FISCAL`, `COMPANY_ADMIN`, `SUPER_ADMIN`

## ✅ Checklist QA por Feature
- [ ] Loading state implementado?
- [ ] Error state com mensagem em PT-MZ?
- [ ] Success feedback visual?
- [ ] Responsivo em mobile?
- [ ] Animações suaves?
- [ ] Cores da paleta MozBus?
- [ ] Acessível (aria-labels, contrastes)?
