import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any): Promise<User> {
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

    return this.prisma.user.create({
      data: {
        ...rest,
        email,
        phone,
        password: hashedPassword,
        role: data.role || 'PASSENGER',
        companyId: data.companyId || null
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

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({});
  }

  async update(id: string, data: { name?: string; phone?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
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
}
