import { AuthProvider, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma/client';
import { AppError } from '../../shared/errors/app-error';
import {
  JwtPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../shared/utils/jwt';

const buildTokens = (payload: JwtPayload) => ({
  accessToken: signAccessToken(payload),
  refreshToken: signRefreshToken(payload),
});

const toPublicUser = (user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider;
  createdAt: Date;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  authProvider: user.authProvider,
  createdAt: user.createdAt,
});

export const authService = {
  async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, 'Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.CUSTOMER,
        authProvider: AuthProvider.LOCAL,
      },
    });

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const tokens = buildTokens(payload);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user: toPublicUser(user), ...tokens };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new AppError(401, 'Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError(401, 'Invalid credentials');

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const tokens = buildTokens(payload);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user: toPublicUser(user), ...tokens };
  },

  async refresh(refreshToken: string) {
    const saved = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!saved) throw new AppError(401, 'Invalid refresh token');

    try {
      verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, 'Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: saved.userId } });
    if (!user) throw new AppError(401, 'Invalid refresh token');

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    return { accessToken };
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authProvider: true,
        createdAt: true,
      },
    });

    if (!user) throw new AppError(404, 'User not found');
    return user;
  },
};
