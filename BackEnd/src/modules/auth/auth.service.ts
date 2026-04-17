import { AuthProvider, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../../config/env';
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

const hashRefreshToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

const buildGoogleAuthUrl = (state: string) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
    throw new AppError(
      500,
      'Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI',
    );
  }

  const search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${search.toString()}`;
};

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
  getGoogleAuthorizationUrl(state: string) {
    return buildGoogleAuthUrl(state);
  },

  async loginWithGoogle(code: string) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
      throw new AppError(
        500,
        'Google OAuth requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI',
      );
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new AppError(401, 'Google token exchange failed');
    }

    const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenPayload.access_token) {
      throw new AppError(401, 'Google access token missing');
    }

    const profileResponse = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
      },
    );

    if (!profileResponse.ok) {
      throw new AppError(401, 'Google profile request failed');
    }

    const profile = (await profileResponse.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      email_verified?: boolean;
    };

    if (!profile.sub || !profile.email) {
      throw new AppError(400, 'Google profile missing required fields');
    }

    const normalizedEmail = profile.email.toLowerCase();
    let user = await prisma.user.findFirst({
      where: {
        authIdentities: {
          some: {
            provider: AuthProvider.GOOGLE,
            providerUserId: profile.sub,
          },
        },
      },
    });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: profile.name ?? normalizedEmail.split('@')[0],
          role: UserRole.CUSTOMER,
          authProvider: AuthProvider.GOOGLE,
          providerId: profile.sub,
        },
      });
    }

    await prisma.authIdentity.upsert({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.GOOGLE,
          providerUserId: profile.sub,
        },
      },
      update: { userId: user.id },
      create: {
        userId: user.id,
        provider: AuthProvider.GOOGLE,
        providerUserId: profile.sub,
      },
    });

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const tokens = buildTokens(payload);

    await prisma.refreshToken.create({
      data: {
        token: hashRefreshToken(tokens.refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user: toPublicUser(user), ...tokens };
  },

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
        authIdentities: {
          create: {
            provider: AuthProvider.LOCAL,
            providerUserId: email.toLowerCase(),
          },
        },
      },
    });

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const tokens = buildTokens(payload);

    await prisma.refreshToken.create({
      data: {
        token: hashRefreshToken(tokens.refreshToken),
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

    await prisma.authIdentity.upsert({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.LOCAL,
          providerUserId: user.email.toLowerCase(),
        },
      },
      update: {},
      create: {
        userId: user.id,
        provider: AuthProvider.LOCAL,
        providerUserId: user.email.toLowerCase(),
      },
    });

    await prisma.refreshToken.create({
      data: {
        token: hashRefreshToken(tokens.refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user: toPublicUser(user), ...tokens };
  },

  async refresh(refreshToken: string) {
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const saved = await prisma.refreshToken.findUnique({ where: { token: refreshTokenHash } });
    if (!saved) throw new AppError(401, 'Invalid refresh token');
    if (saved.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: saved.id } });
      throw new AppError(401, 'Refresh token expired');
    }

    try {
      verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, 'Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: saved.userId } });
    if (!user) throw new AppError(401, 'Invalid refresh token');

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const nextRefreshToken = signRefreshToken(payload);
    const nextRefreshTokenHash = hashRefreshToken(nextRefreshToken);

    await prisma.refreshToken.update({
      where: { id: saved.id },
      data: {
        token: nextRefreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken: nextRefreshToken };
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: hashRefreshToken(refreshToken) } });
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
