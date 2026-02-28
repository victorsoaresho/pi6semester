import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Placeholder para Redis — substituir por Redis em produção
  private readonly blacklistedTokens = new Set<string>();
  private readonly resetTokens = new Map<string, { userId: string; expiresAt: Date }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { cnpj: dto.cnpj }],
      },
    });

    if (existingUser) {
      throw new ConflictException('E-mail ou CNPJ já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        companyName: dto.companyName,
        cnpj: dto.cnpj,
        address: dto.address,
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Conta ainda não ativada. Aguarde a aprovação do administrador.',
      );
    }

    const tokens = await this.generateTokenPair(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
      ...tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    if (this.blacklistedTokens.has(dto.refreshToken)) {
      throw new UnauthorizedException('Token revogado');
    }

    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status === 'BLOCKED') {
        throw new UnauthorizedException();
      }

      this.blacklistedTokens.add(dto.refreshToken);

      return this.generateTokenPair(user.id, user.role);
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async logout(refreshToken: string) {
    this.blacklistedTokens.add(refreshToken);
    return { message: 'Logout realizado com sucesso' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Retorna sucesso mesmo se o e-mail não existir (segurança)
    if (!user) {
      return { message: 'Se o e-mail existir, um link de recuperação será enviado' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    this.resetTokens.set(token, { userId: user.id, expiresAt });

    // TODO: Enviar e-mail via BullMQ job
    this.logger.log(`[RESET PASSWORD] Token para ${user.email}: ${token}`);

    return { message: 'Se o e-mail existir, um link de recuperação será enviado' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const stored = this.resetTokens.get(dto.token);

    if (!stored || stored.expiresAt < new Date()) {
      this.resetTokens.delete(dto.token);
      throw new BadRequestException('Token inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: stored.userId },
      data: { passwordHash },
    });

    this.resetTokens.delete(dto.token);

    return { message: 'Senha redefinida com sucesso' };
  }

  private async generateTokenPair(userId: string, role: string) {
    const payload = { sub: userId, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiration', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
