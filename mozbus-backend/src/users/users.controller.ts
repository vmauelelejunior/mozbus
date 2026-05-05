import { Controller, Get, Param, UseGuards, Patch, Body, Post, Req, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Utilizadores')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('avatar/upload/:id')
  @ApiOperation({ summary: 'Carregar foto de perfil' })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  }))
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Nenhum ficheiro detectado.');
    }
    try {
      return await this.usersService.updateAvatar(id, file);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todos os utilizadores' })
  findAll(@Req() req: any) {
    return this.usersService.findAll(req.user);
  }

  @Public()
  @Get('phone/:phone')
  @ApiOperation({ summary: 'Obter utilizador por telefone' })
  findByPhone(@Param('phone') phone: string) {
    return this.usersService.findByPhone(phone);
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
  create(@Req() req: any, @Body() data: any) {
    return this.usersService.create(data, req.user);
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