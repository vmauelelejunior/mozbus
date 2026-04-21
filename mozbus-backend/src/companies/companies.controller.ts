import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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
  create(@Body() createCompanyDto: any) {
    return this.companiesService.create(createCompanyDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todas as empresas' })
  findAll() {
    return this.companiesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma empresa' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }
}
