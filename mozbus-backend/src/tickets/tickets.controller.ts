import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Bilhetes')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('book')
  @ApiOperation({ summary: 'Reservar assento e gerar bilhete' })
  book(@Body() data: { tripId: string; seatNumber: number; passengerId: string }) {
    return this.ticketsService.bookTicket(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  @ApiOperation({ summary: 'Simular pagamento do bilhete' })
  pay(@Param('id') id: string) {
    return this.ticketsService.payTicket(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('scan')
  @ApiOperation({ summary: 'Validar QR Code (Módulo Fiscal)' })
  scan(@Body('qrCode') qrCode: string) {
    return this.ticketsService.scanTicket(qrCode);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes do bilhete' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar bilhetes do utilizador' })
  findByUser(@Param('userId') userId: string) {
    return this.ticketsService.findByUser(userId);
  }
}
