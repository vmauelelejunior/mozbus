import { Controller, Get, Query, Param, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TripsService } from './trips.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Viagens')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Buscar viagens disponíveis' })
  search(
      @Query('origin') origin: string, 
      @Query('destination') destination: string,
      @Query('date') date?: string
  ) {
    return this.tripsService.search({ origin, destination, date });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Obter todas as viagens da empresa (dashboard)' })
  findAll(@Req() req: any, @Query('companyId') companyId?: string) {
    return this.tripsService.findAll(req.user, companyId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma viagem específica' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.tripsService.findOne(id, req?.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar uma nova viagem' })
  create(@Req() req: any, @Body() data: { departureTime: string, price: number, busId: string, routeId: string }) {
      return this.tripsService.create({
          ...data,
          departureTime: new Date(data.departureTime)
      }, req.user);
  }
}
