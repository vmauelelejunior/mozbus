---
name: mozbus-stitch-designer
description: Skill de design de elite para o Stitch MCP - especialista em UX de bilheteria e interfaces premium
---

# MozBus Stitch Designer Skill 🎨

Esta skill atua como a ponte entre o **Stitch MCP** e os padrões de excelência **MozBus 10/10**. Ela deve ser usada para garantir que qualquer ecrã gerado ou editado pelo Stitch siga o nível mais elevado de design de interfaces de transporte e bilhética.

## 💎 Princípios de Design "10/10"

### 0. Contexto Visual (Crucial)
- **Referência:** Analisar sempre os screenshots atuais do MozBus em `C:\Users\kylec\.gemini\antigravity\brain\39155ddd-0c8d-4f4c-9740-7b27302e9934\`.
- **Evolução:** Não descartar a funcionalidade da grelha atual, mas envolvê-la numa estética "Luxury in Motion".
- **Fidelidade:** Manter a consistência com o tema preto absoluto já implementado no código principal.

### 1. Estética "Cyber-Premium"
- **Black Background:** Sempre usar fundo preto absoluto (#000000).
- **Orange Accents:** Cor da marca (#f97316) para acções principais, focos e estados "active".
- **Glassmorphism:** Uso intensivo de transparências desfocadas (blur: 24px-32px).
- **High-Contrast Borders:** Bordas finas (1px) brancas com opacidade 5-8% para separar secções.

### 2. UX de Escolha de Assento (Elite)
- **Perspectiva:** Usar uma representação isométrica ou visualmente rica do autocarro (não apenas uma grelha plana).
- **Feedback:** Assentos devem reagir ao hover com escala e brilho laranja.
- **Informação Contextual:** Mostrar miniatura do assento e tipo (Leito, Executivo) ao clicar.
- **Micro-interacções:** Animações de confirmação ao seleccionar (checkmark animado).

### 3. Diálogo com o Stitch (Prompts de Ouro)
Ao usar `generate_screen_from_text` ou `edit_screens`, incluir sempre:
- *"Apply a premium dark glassmorphism aesthetic with #f97316 as the primary brand color."*
- *"Use high-end typography (e.g. Inter/Geist Black) for titles with tight letter-spacing."*
- *"Ensure all cards have rounded corners [32px] and subtle gradients."*
- *"Layout must follow elite airline/bus booking standards (clean, focused, professional)."*

## 🎟️ Referências de Excelência (Benchmarks)
- **Airline Booking:** Estética da Delta/Emirates (foco em luxo e clareza).
- **Modern Ticketing:** Ticketmaster/Fandango (frequência de uso e eficiência).
- **SaaS Premium:** Linear/Vercel (estética dark, bordas precisas, tipografia impecável).

## 🛠️ Como usar com Stitch MCP
1. **Criar Projecto:** `create_project(title="MozBus Ecosystem")`
2. **Design System:** `create_design_system` enviando a paleta de cores e o MD de design definido na skill `mozbus-excellence-10-10`.
3. **Geração Iterativa:** Pedir ecrãs específicos (ex: Login, Seat Selection) e solicitar edições focadas em UX e Elegância.
