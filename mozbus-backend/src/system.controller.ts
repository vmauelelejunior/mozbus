import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller('system')
export class SystemController {
  
  @Get('info')
  @ApiOperation({ summary: 'Retorna informações básicas do sistema MozBus' })
  getInfo() {
    return {
      name: 'MozBus Ecosystem API',
      version: '1.0.0',
      status: 'Online',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}
