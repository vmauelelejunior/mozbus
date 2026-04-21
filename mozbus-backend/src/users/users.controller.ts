import { Controller, Get, Param, UseGuards, Patch, Body, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Utilizadores')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todos os utilizadores' })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/:companyId')
  @ApiOperation({ summary: 'Listar equipa da empresa' })
  findByCompany(@Param('companyId') companyId: string) {
    return this.usersService.findByCompany(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar novo utilizador (Gestão)' })
  create(@Body() data: any) {
    return this.usersService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obter utilizador por ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar dados do utilizador' })
  update(@Param('id') id: string, @Body() data: { name?: string; phone?: string }) {
    return this.usersService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Alterar palavra-passe' })
  changePassword(@Body() body: { userId: string; currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(body.userId, body.currentPassword, body.newPassword);
  }
}