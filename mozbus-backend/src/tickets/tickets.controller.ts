import { Controller, Post, Get, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
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
  book(@Body() data: { 
    tripId: string; 
    seatNumber: number; 
    passengerId: string;
    luggages?: { type: string; weight?: number; description?: string; price: number }[]
  }, @Req() req: any) {
    return this.ticketsService.bookTicket(data, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  @ApiOperation({ summary: 'Simular pagamento do bilhete' })
  pay(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.payTicket(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('scan')
  @ApiOperation({ summary: 'Validar QR Code (Módulo Fiscal)' })
  scan(@Body('qrCode') qrCode: string) {
    return this.ticketsService.scanTicket(qrCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todos bilhetes (dashboard)' })
  findAll(@Req() req: any, @Query('companyId') optionalCompanyId?: string) {
    return this.ticketsService.findAll(req.user, optionalCompanyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes do bilhete' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar bilhetes do utilizador' })
  findByUser(@Param('userId') userId: string) {
    return this.ticketsService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar reserva/bilhete' })
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.cancelTicket(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/edit-seat')
  @ApiOperation({ summary: 'Editar assento da reserva' })
  editSeat(@Param('id') id: string, @Body('newSeatNumber') newSeatNumber: number, @Req() req: any) {
    return this.ticketsService.updateTicketSeat(id, newSeatNumber, req.user);
  }
}
