import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/utils/prisma';
import { ApiError } from '@/utils/ApiError';
import { RegisterDTO, LoginDTO, AuthTokens, JwtPayload, AuthResponse } from '@/types';
import { generateResetToken } from '@/utils/helpers';

export class AuthService {
  private readonly SALT_ROUNDS = 12;

  async register(data: RegisterDTO, userAgent?: string, ipAddress?: string): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'VIEWER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.role);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, tokens };
  }

  async login(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.role);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    await prisma.session.delete({
      where: { id: session.id },
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      throw new ApiError(500, 'JWT refresh secret not configured');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, jwtRefreshSecret) as JwtPayload;
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: {
        user: {
          select: { id: true, role: true, isActive: true },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new ApiError(401, 'Session expired, please login again');
    }

    if (!session.user.isActive) {
      throw new ApiError(403, 'Account is deactivated');
    }

    const tokens = await this.generateTokens(session.user.id, session.user.role);

    await prisma.session.delete({ where: { id: session.id } });

    await prisma.session.create({
      data: {
        userId: session.user.id,
        refreshToken: tokens.refreshToken,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(404, 'User with this email not found');
    }

    const resetToken = generateResetToken();
    const hashedToken = await bcrypt.hash(resetToken, this.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const users = await prisma.user.findMany({
      where: {
        resetToken: { not: null },
        resetTokenExpiresAt: { gt: new Date() },
      },
      select: { id: true, resetToken: true },
    });

    let matchedUser: { id: string } | null = null;
    for (const u of users) {
      if (u.resetToken && (await bcrypt.compare(token, u.resetToken))) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: matchedUser.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }

  async generateTokens(userId: string, role: string): Promise<AuthTokens> {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'];
    const jwtRefreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new ApiError(500, 'JWT secrets not configured');
    }

    const payload: JwtPayload = { userId, role: role as JwtPayload['role'] };

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
    const refreshToken = jwt.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
