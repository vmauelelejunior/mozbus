# MozBus Sophistication Designer (Modo Ultra Absoluto)

Esta skill é o guardião da estética de elite e da psicologia comportamental no ecossistema MozBus. Ela dita as regras para transformar interfaces funcionais em experiências de luxo digital que geram retenção e conforto.

## 🎨 Princípios de Design Comportamental

1. **A Teoria do "Material Físico":**
   - Nada é puramente digital. Superfícies devem parecer vidro, metal ou carbono.
   - Use `backdrop-blur` de alta densidade (20px+) para criar profundidade real.
   - Bordas devem ter gradientes sutis para simular a reflexão da luz em cantos arredondados.

2. **Paleta de Engajamento (Ultra Absolute):**
   - **Base:** `#0B0B0F` (Midnight Carbon) - gera uma sensação de infinito e segurança.
   - **Acento:** `#0EA5E9` (Electric Sky) - gatilho de inovação e confiança.
   - **Superfícies:** `#16161E` (High-End Slate) - separação clara que evita a fadiga visual.
   - **Tipografia:** `Inter` ou `Geist` com pesos variados. Use `text-white/90` para conteúdo principal e `text-white/50` para metadados.

3. **Gatilhos de Recompensa (Micro-Interações):**
   - **Hover:** O elemento não deve apenas mudar de cor, deve "respirar" (escala 1.02 + glow suave).
   - **Feedback de Clique:** Expansão de luz ou mudança de estado fluida via Framer Motion.
   - **Estados de Espera:** Use `EliteLoader` com gradientes em movimento para transformar a espera num momento de apreciação estética.

4. **Simplicidade Elegante (Luxo é Espaço):**
   - Evite aglomeração. Use `padding` generoso.
   - Hierarquia visual: O olho deve ser guiado naturalmente para o botão de "Venda" ou "Reserva" através de luz e cor, não por tamanho de fonte excessivo.

## 🛠️ Regras de Implementação Técnica

- **CSS Variables:** Mantenha sempre variáveis globais para fácil ajuste de "temperatura" do tema.
- **Glassmorphism:** `bg-white/[0.03]` + `border-white/[0.08]` + `backdrop-blur-2xl`.
- **Animações:** Use `spring` configurations em vez de `linear` para movimentos que pareçam naturais.
