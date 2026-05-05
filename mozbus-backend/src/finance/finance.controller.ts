import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('stats')
  async getGlobalStats() {
    return this.financeService.getGlobalStats();
  }

  @Get('transactions')
  async getTransactions(@Query('limit') limit: number) {
    return this.financeService.getTransactions(limit);
  }
}
