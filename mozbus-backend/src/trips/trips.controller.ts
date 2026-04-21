import { Controller, Get, Query, Param, Post, Body, UseGuards } from '@nestjs/common';
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

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma viagem específica' })
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar uma nova viagem' })
  create(@Body() data: { departureTime: string, price: number, busId: string, routeId: string }) {
      return this.tripsService.create({
          ...data,
          departureTime: new Date(data.departureTime)
      });
  }
}
