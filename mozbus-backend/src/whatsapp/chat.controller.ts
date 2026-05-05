import { Controller, Post, Body, Res } from '@nestjs/common';
import { LumianaService } from './lumiana.service';
import { Response } from 'express';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly lumianaService: LumianaService) {}

  @Post()
  async handleChat(@Body() body: any, @Res() res: any) {
    const { messages, user } = body;
    
    // Pegar a última mensagem do utilizador
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Converter o histórico para o formato que a LumianaService espera
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Obter contexto do utilizador se disponível
    const context = await this.lumianaService.getUserContext({
      userId: user?.id,
    });

    // Gerar resposta em stream
    const result = await this.lumianaService.streamResponse(
      lastMessage,
      history,
      context,
    );

    // Configura os headers para streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    
    // Envia o stream para o utilizador
    return result.pipeTextStreamToResponse(res);
  }
}
