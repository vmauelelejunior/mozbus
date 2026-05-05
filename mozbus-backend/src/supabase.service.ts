import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  async uploadFile(bucket: string, path: string, file: Buffer, contentType: string) {
    // 1. Tentar garantir que o bucket existe
    const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
    console.log('Buckets disponíveis no Supabase:', buckets?.map(b => b.name) || []);
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
    } else {
      const bucketExists = buckets.some(b => b.name === bucket);
      if (!bucketExists) {
        console.log(`Bucket "${bucket}" não encontrado. Tentando criar...`);
        const { error: createError } = await this.supabase.storage.createBucket(bucket, { public: true });
        if (createError) {
          console.error(`Falha ao criar bucket "${bucket}":`, createError.message);
          // Se falhar, continuamos para ver se o upload funciona (talvez o listBuckets falhou mas o bucket existe)
        } else {
          console.log(`Bucket "${bucket}" criado com sucesso.`);
        }
      }
    }

    // 2. Realizar o upload (Simplificado para evitar conflitos de RLS)
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Supabase Upload Error:', error);
      if (error.message.includes('Bucket not found')) {
        throw new Error(`O bucket "${bucket}" não existe no teu Supabase. Por favor, cria um bucket público chamado "${bucket}" no painel do Supabase.`);
      }
      throw new Error(`Erro Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }
}
