import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SupabaseService } from '../supabase.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService
  ) {}

  async create(data: any, user?: any): Promise<User> {
    const { password, email, phone, ...rest } = data;

    // Verificar se já existe
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (exists) {
        throw new ConflictException('Usuário com este e-mail ou telefone já cadastrado.');
    }

    // Salt rounds de elite (12)
    const hashedPassword = await bcrypt.hash(password, 12);

    let companyId = data.companyId;

    if (user && user.role === 'COMPANY_ADMIN') {
        companyId = user.companyId;
        if (!companyId) throw new Error('Acesso negado: Administrador sem empresa.');
        if (data.role === 'SUPER_ADMIN') throw new Error('Não pode criar administradores de topo.');
    }

    return this.prisma.user.create({
      data: {
        ...rest,
        email,
        phone,
        password: hashedPassword,
        role: data.role || 'PASSENGER',
        companyId: companyId || null
      }
    });
  }

  async findByCompany(companyId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone }
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username }
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async findAll(user: any): Promise<User[]> {
    const where: any = {};
    if (user.role === 'COMPANY_ADMIN') {
        where.companyId = user.companyId;
    }
    return this.prisma.user.findMany({ where });
  }

  async update(id: string, data: { name?: string; phone?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
      }
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('Utilizador não encontrado');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error('Palavra-passe actual incorrecta');

    const hashed = await bcrypt.hash(newPassword, 12);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashed }
    });
  }

  async updateAvatar(id: string, file: any) {
    const fileName = `${id}-${Date.now()}-${file.originalname}`;
    const publicUrl = await this.supabase.uploadFile(
      'avatars',
      fileName,
      file.buffer,
      file.mimetype
    );

    return this.prisma.user.update({
      where: { id },
      data: { avatar: publicUrl }
    });
  }
}
