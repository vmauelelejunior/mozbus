import { Controller, Get, Post, Query, Body, Res, HttpCode, Logger } from '@nestjs/common';
import * as express from 'express';
import { WhatsAppService } from './whatsapp.service';

import { Public } from '../auth/public.decorator';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';

/**
 * WhatsAppController — Endpoint do Webhook para a Meta WhatsApp Cloud API.
 * 
 * Rotas:
 * - GET  /whatsapp/webhook → Verificação do webhook (Meta setup)
 * - POST /whatsapp/webhook → Receber mensagens dos clientes
 * 
 * Ambas as rotas são públicas (sem JWT) porque a Meta precisa acessá-las.
 */
@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private readonly whatsappService: WhatsAppService) {}

  /**
   * GET /whatsapp/webhook
   * Verificação do webhook — Meta envia um challenge que devemos devolver.
   */
  @Get('webhook')
  @Public()
  @ApiOperation({ summary: 'Verificação do webhook do WhatsApp (Meta)' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: express.Response,

  ) {
    const result = this.whatsappService.verifyWebhook(mode, token, challenge);

    if (result) {
      return res.status(200).send(result);
    }

    return res.status(403).send('Verificação falhou');
  }

  /**
   * POST /whatsapp/webhook
   * Recebe mensagens do WhatsApp. A Meta exige resposta 200 imediata.
   */
  @Post('webhook')
  @Public()
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async handleIncomingMessage(@Body() body: any) {
    // Responder 200 imediatamente (requisito da Meta)
    // Processar em background
    this.whatsappService.processIncomingMessage(body).catch((err) => {
      this.logger.error('Erro ao processar mensagem WhatsApp:', err);
    });

    return 'EVENT_RECEIVED';
  }
}
