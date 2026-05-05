---
name: mozbus-ai-chat-fixer
description: Skill de diagnóstico e reparação da integração AI Chat (Lúcia) no MozBus — compatível com ai v6 e @ai-sdk/react v6
---

# MozBus AI Chat Fixer

## Contexto Crítico: Versões dos Pacotes
O projecto usa versões **v6** dos pacotes Vercel AI SDK. A API mudou COMPLETAMENTE face às versões anteriores.

```json
"ai": "^6.0.168",
"@ai-sdk/react": "^3.0.170",
"@ai-sdk/google": "^3.0.64"
```

---

## Regras do `useChat` (@ai-sdk/react v6)

### ❌ API ANTIGA (quebrada — não usar)
```tsx
const { input, handleInputChange, handleSubmit, isLoading } = useChat({ ... });
// ERRO: input é undefined, handleInputChange não existe
```

### ✅ API CORRECTA (v6)
```tsx
const { messages, sendMessage, status } = useChat({ api: '/api/chat', initialMessages: [...] });
const isLoading = status === 'streaming' || status === 'submitted';
```

### ✅ Como enviar mensagem (v6)
```tsx
// CORRECTO: usar { text: '...' }
sendMessage({ text: inputValue.trim() });

// ERRADO: usar role/content
sendMessage({ role: 'user', content: '...' }); // ← QUEBRA!
```

### ✅ Gerir o input com estado local
```tsx
const [inputValue, setInputValue] = useState('');
// input do useChat não existe — gerir sempre com useState local
```

### ✅ Renderizar conteúdo das mensagens (v6 usa parts)
```tsx
{message.parts
  ? message.parts
      .filter((p: { type: string }) => p.type === 'text')
      .map((p: { type: string; text: string }, i: number) => <span key={i}>{p.text}</span>)
  : (message as { content?: string }).content ?? ''}
```

---

## Regras da Rota `/api/chat` (ai v6)

### ❌ Método antigo (quebrado)
```ts
return result.toDataStreamResponse(); // NÃO EXISTE em v6
```

### ✅ Método correcto (v6)
```ts
import { streamText } from 'ai';
const result = streamText({ model: google('gemini-1.5-flash', { apiKey }), ... });
return result.toUIMessageStreamResponse(); // ← CORRECTO em v6
```

### ✅ Normalizar mensagens da request (v6 envia parts[])
```ts
const messages = body.messages ?? [];
const formattedMessages = messages
  .filter((m) => m.role === 'user' || m.role === 'assistant')
  .map((m) => {
    let content = '';
    if (typeof m.content === 'string') content = m.content;
    else if (Array.isArray(m.parts)) {
      content = m.parts.filter(p => p.type === 'text').map(p => p.text ?? '').join('');
    }
    return { role: m.role as 'user' | 'assistant', content };
  })
  .filter((m) => m.content.trim() !== '');
```

---

## Variável de Ambiente
O `@ai-sdk/google` detecta automaticamente `GOOGLE_GENERATIVE_AI_API_KEY`.
Sempre adicionar ao `.env.local`:
```
GEMINI_API_KEY="<chave>"
GOOGLE_GENERATIVE_AI_API_KEY="<chave>"
```
E passar explicitamente: `google('gemini-1.5-flash', { apiKey })`

---

## Prevenir Hydration Mismatch
O `ChatSupport` deve sempre montar apenas no cliente:
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
if (!mounted) return null;
```

---

## Diagnóstico Rápido
Se o chat não funciona:
1. Verifica `status` em vez de `isLoading`
2. Verifica se `sendMessage({ text })` — não `sendMessage({ role, content })`
3. Verifica se a rota usa `toUIMessageStreamResponse()`
4. Verifica se há `GOOGLE_GENERATIVE_AI_API_KEY` no `.env.local`
5. Reinicia o servidor após alterar `.env.local`
