import { Controller, Get, Post, Body, Param, UseGuards, Patch, Req, ForbiddenException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Empresas')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Cadastrar nova empresa' })
  create(@Req() req: any, @Body() createCompanyDto: any) {
    return this.companiesService.create(createCompanyDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todas as empresas' })
  findAll(@Req() req: any) {
    return this.companiesService.findAll(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma empresa' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.companiesService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar estado de uma empresa. REQUERIDO: SUPER_ADMIN' })
  updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: { status: string }) {
    if (req.user?.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Apenas o CEO (SUPER_ADMIN) tem permissão para alterar o status das operadoras.');
    }
    return this.companiesService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/plan')
  @ApiOperation({ summary: 'Alterar plano de uma empresa. REQUERIDO: SUPER_ADMIN' })
  updatePlan(@Req() req: any, @Param('id') id: string, @Body() body: { plan: string }) {
    if (req.user?.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Apenas o CEO (SUPER_ADMIN) tem permissão para alterar o plano das operadoras.');
    }
    return this.companiesService.updatePlan(id, body.plan);
  }
}
