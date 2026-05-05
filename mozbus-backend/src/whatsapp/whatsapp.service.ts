import { Injectable, Logger } from '@nestjs/common';
import { LumianaService } from './lumiana.service';

/**
 * WhatsAppService — Gerencia a comunicação com a API do WhatsApp Business (Meta Cloud API).
 * 
 * Fluxo:
 * 1. Meta envia mensagem do cliente via webhook → WhatsAppController
 * 2. WhatsAppController extrai texto e telefone → WhatsAppService
 * 3. WhatsAppService busca contexto + gera resposta via LumianaService
 * 4. WhatsAppService envia resposta de volta ao WhatsApp via API
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  
  // Cache simples de conversas (em produção, usar Redis)
  private conversationCache = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>();

  constructor(private readonly lumiana: LumianaService) {}

  /**
   * Verifica o webhook (Meta exige verificação no setup).
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'mozbus_lumiana_2026';
    
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('✅ Webhook do WhatsApp verificado com sucesso!');
      return challenge;
    }
    
    this.logger.warn('❌ Falha na verificação do webhook');
    return null;
  }

  /**
   * Processa mensagem recebida do WhatsApp.
   */
  async processIncomingMessage(body: any): Promise<void> {
    try {
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Ignora se não for mensagem (pode ser status update, etc.)
      if (!value?.messages || value.messages.length === 0) {
        return;
      }

      const message = value.messages[0];
      const senderPhone = message.from; // Número do remetente (ex: "258841234567")
      const senderName = value.contacts?.[0]?.profile?.name || 'Cliente';
      
      // Só processa mensagens de texto por agora
      if (message.type !== 'text') {
        await this.sendMessage(
          senderPhone,
          'Olá! De momento só consigo ler mensagens de texto 📝. Pode escrever a sua questão que eu ajudo! 😊'
        );
        return;
      }

      const userMessage = message.text.body;
      this.logger.log(`📩 Mensagem de ${senderName} (${senderPhone}): ${userMessage}`);

      // Marcar como "lida"
      await this.markAsRead(message.id);

      // Mostrar "a escrever..."
      // (WhatsApp não tem typing indicator via API, mas podemos processar rápido)

      // Buscar histórico da conversa
      const history = this.conversationCache.get(senderPhone) || [];

      // Buscar contexto do utilizador
      const userContext = await this.lumiana.getUserContext({ phone: senderPhone });

      // Gerar resposta da Lumiana
      const response = await this.lumiana.generateResponse(userMessage, history, userContext);

      // Atualizar histórico (manter últimas 20 mensagens)
      history.push({ role: 'user', content: userMessage });
      history.push({ role: 'assistant', content: response });
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      this.conversationCache.set(senderPhone, history);

      // Enviar resposta
      await this.sendMessage(senderPhone, response);
      this.logger.log(`📤 Resposta enviada para ${senderPhone}`);
    } catch (error) {
      this.logger.error('Erro ao processar mensagem do WhatsApp:', error);
    }
  }

  /**
   * Envia mensagem de texto via WhatsApp Cloud API.
   */
  async sendMessage(to: string, text: string): Promise<void> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      this.logger.error('❌ WHATSAPP_PHONE_NUMBER_ID ou WHATSAPP_ACCESS_TOKEN não configurados!');
      return;
    }

    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { 
            preview_url: true,
            body: text,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Erro ao enviar mensagem WhatsApp:', JSON.stringify(errorData));
      }
    } catch (error) {
      this.logger.error('Falha na chamada à API do WhatsApp:', error);
    }
  }

  /**
   * Marca mensagem como lida no WhatsApp.
   */
  private async markAsRead(messageId: string): Promise<void> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) return;

    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });
    } catch (error) {
      this.logger.warn('Não foi possível marcar mensagem como lida:', error);
    }
  }

  /**
   * Limpa conversas inativas (chamar periodicamente).
   */
  cleanupOldConversations(): void {
    // Em produção, implementar com TTL via Redis
    if (this.conversationCache.size > 1000) {
      this.conversationCache.clear();
      this.logger.log('🧹 Cache de conversas limpo');
    }
  }
}
