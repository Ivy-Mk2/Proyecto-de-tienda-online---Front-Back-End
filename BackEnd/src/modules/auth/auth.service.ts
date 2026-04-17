import { AuthProvider, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma/client';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/app-error';
import {
  JwtPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../shared/utils/jwt';

type SocialProfile = {
  providerUserId: string;
  email: string;
  name: string;
};

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

const issueSession = async (user: {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  authProvider: AuthProvider;
  createdAt: Date;
}) => {
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
};

const ensureNoEmailConflict = async (email: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'Email already in use with another sign-in method');
  }
};

const verifyGoogleCredential = async (credential: string): Promise<SocialProfile> => {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
  );

  if (!response.ok) throw new AppError(401, 'Invalid Google credential');

  const payload = (await response.json()) as {
    aud?: string;
    sub?: string;
    email?: string;
    name?: string;
    email_verified?: string | boolean;
  };

  if (payload.aud !== env.GOOGLE_CLIENT_ID || !payload.sub || !payload.email) {
    throw new AppError(401, 'Invalid Google credential');
  }

  const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
  if (!emailVerified) throw new AppError(401, 'Google email is not verified');

  return {
    providerUserId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split('@')[0],
  };
};

const verifyFacebookToken = async (accessToken: string): Promise<SocialProfile> => {
  const appAccessToken = `${env.FACEBOOK_APP_ID}|${env.FACEBOOK_APP_SECRET}`;
  const debugResponse = await fetch(
    `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appAccessToken)}`,
  );

  if (!debugResponse.ok) throw new AppError(401, 'Invalid Facebook credential');

  const debugPayload = (await debugResponse.json()) as {
    data?: { is_valid?: boolean; app_id?: string; user_id?: string };
  };

  if (!debugPayload.data?.is_valid || debugPayload.data.app_id !== env.FACEBOOK_APP_ID) {
    throw new AppError(401, 'Invalid Facebook credential');
  }

  const profileResponse = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`,
  );

  if (!profileResponse.ok) throw new AppError(401, 'Unable to fetch Facebook profile');

  const profile = (await profileResponse.json()) as { id?: string; name?: string; email?: string };

  if (!profile.id || !profile.email) {
    throw new AppError(400, 'Facebook account does not provide a valid email');
  }

  return {
    providerUserId: profile.id,
    email: profile.email.toLowerCase(),
    name: profile.name?.trim() || profile.email.split('@')[0],
  };
};

const authenticateSocial = async (provider: "GOOGLE" | "FACEBOOK", profile: SocialProfile) => {
  const existingIdentity = await prisma.user.findFirst({
    where: {
      authProvider: provider,
      providerId: profile.providerUserId,
    },
  });

  if (existingIdentity) {
    return issueSession(existingIdentity);
  }

  await ensureNoEmailConflict(profile.email);

  const createdUser = await prisma.user.create({
    data: {
      name: profile.name,
      email: profile.email,
      role: UserRole.CUSTOMER,
      authProvider: provider,
      providerId: profile.providerUserId,
    },
  });

  return issueSession(createdUser);
};

export const authService = {
  async register(name: string, email: string, password: string) {
    await ensureNoEmailConflict(email.toLowerCase());

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: UserRole.CUSTOMER,
        authProvider: AuthProvider.LOCAL,
      },
    });

    return issueSession(user);
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) throw new AppError(401, 'Invalid credentials');
    if (user.authProvider !== AuthProvider.LOCAL || !user.passwordHash) {
      throw new AppError(401, `Use ${user.authProvider.toLowerCase()} sign-in for this account`);
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError(401, 'Invalid credentials');

    return issueSession(user);
  },

  async google(credential: string) {
    const googleProfile = await verifyGoogleCredential(credential);
    return authenticateSocial(AuthProvider.GOOGLE, googleProfile);
  },

  async facebook(accessToken: string) {
    const facebookProfile = await verifyFacebookToken(accessToken);
    return authenticateSocial(AuthProvider.FACEBOOK, facebookProfile);
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
