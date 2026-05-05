import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { BusesService } from './buses.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Ônibus')
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Cadastrar nova viatura' })
  create(@Req() req: any, @Body() data: any) {
    return this.busesService.create(data, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar toda a frota' })
  findAll(@Req() req: any) {
    return this.busesService.findAll(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/:companyId')
  @ApiOperation({ summary: 'Listar frotas por empresa' })
  findByCompany(@Req() req: any, @Param('companyId') companyId: string) {
    return this.busesService.findByCompany(companyId, req.user);
  }

  @Public()
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.busesService.findOne(id, req?.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.busesService.update(id, data, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.busesService.remove(id, req.user);
  }
}
