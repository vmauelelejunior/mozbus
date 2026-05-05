---
name: mozbus-pos-handheld-optimization
description: Optimização de UX/UI e Impressão para terminais portáteis Android (Sunmi P2, PAX, etc.)
---

# MozBus POS Handheld Optimization

## Especificações Sunmi P2
- **Ecrã**: 5.5" FWVGA / HD+ (Retrato)
- **Impressora**: Térmica 58mm (Velocidade ~70mm/s)
- **Navegador**: WebView / Chrome Android

## Regras de Design (Mobile First)
1. **Toque de Elite**: Botões com altura mínima de 56px para operação com polegar.
2. **Contraste Máximo**: Evitar gradientes subtis; usar Aura Negra pura com bordas definidas para visibilidade sob luz solar.
3. **Escala de Bilhete**: Definir largura fixa de `58mm` no CSS de impressão.

## Ajustes Técnicos
- Desativar animações de Framer Motion complexas se o `hardwareConcurrency < 4`.
- Forçar `zoom: 0.8` em ecrãs com largura inferior a 500px para manter densidade de informação.
