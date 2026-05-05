import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Executa uma função dentro de uma transação com o contexto RLS definido.
   * Garantia total de que o 'Muro de Ferro' será aplicado corretamente.
   */
  async runAsUser<T>(user: any, fn: (tx: any) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      const companyId = user?.companyId || '';
      const userId = user?.id || '';
      const role = user?.role || 'GUEST';

      await tx.$executeRawUnsafe(`
        SELECT 
          set_config('app.current_user_id', '${userId}', true),
          set_config('app.current_company_id', '${companyId}', true),
          set_config('app.user_role', '${role}', true);
      `);
      
      return fn(tx);
    }, {
      maxWait: 10000, // 10 seconds max wait to connect
      timeout: 20000, // 20 seconds max execution time
    });
  }
}
