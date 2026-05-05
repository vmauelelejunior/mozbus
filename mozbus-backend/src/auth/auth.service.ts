import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    let user = await this.usersService.findByEmail(identifier);
    if (!user) {
      user = await this.usersService.findByUsername(identifier);
    }
    if (!user) {
      user = await this.usersService.findByPhone(identifier);
    }

    if (user) {
      const match = await bcrypt.compare(pass, user.password);
      if (match) {
        // Block suspended companies
        if (user.companyId && user.role === 'COMPANY_ADMIN') {
           const company = await this.prisma.company.findUnique({
              where: { id: user.companyId }
           });
           if (company && company.status === 'SUSPENDED') {
               throw new ForbiddenException('A sua empresa encontra-se suspensa do ecossistema MozBus. Contacte o suporte.');
           }
        }

        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        companyId: user.companyId
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        companyId: user.companyId
      }
    };
  }

  async register(userData: any) {
    const user = await this.usersService.create(userData);
    return this.login(user);
  }

  async forgotPassword(identifier: string) {
    let user = await this.usersService.findByEmail(identifier);
    if (!user) {
        user = await this.usersService.findByPhone(identifier);
    }
    
    if (!user) {
        // Por segurança, não confirmamos se o utilizador existe
        return { message: 'Se o identificador existir, as instruções foram enviadas.' };
    }

    // Gerar token simples de 6 dígitos para o demo (ou uuid para real)
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hora de validade

    await this.prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken: token,
            resetTokenExpires: expires
        }
    });

    // Simular envio de e-mail
    console.log(`[EMAIL MOCK] Para: ${user.email} | Assunto: Recuperação de Senha | Token: ${token}`);
    
    return { message: 'Instruções de recuperação enviadas para o seu e-mail.' };
  }

  async resetPassword(token: string, newPass: string) {
    const user = await this.prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpires: { gt: new Date() }
        }
    });

    if (!user) {
        throw new ForbiddenException('Token inválido ou expirado.');
    }

    const hashed = await bcrypt.hash(newPass, 12);

    await this.prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashed,
            resetToken: null,
            resetTokenExpires: null
        }
    });

    return { message: 'Senha redefinida com sucesso. Faça login com a sua nova senha.' };
  }
}
