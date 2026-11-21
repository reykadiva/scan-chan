import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { localDb, type LocalUser } from '@/lib/database/local-db';
import { cookies } from 'next/headers';

export interface UserSessionData {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  mode: 'ARASHU';
}

export async function setSessionCookie(user: UserSessionData) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('scan_session', JSON.stringify(user), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      sameSite: 'lax',
    });
    cookieStore.set('scan_mode', 'hunter', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
      sameSite: 'lax',
    });
  } catch {
    // Ignore outside of Next.js server request context (e.g. CLI/tests)
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('scan_session');
    cookieStore.delete('scan_mode');
  } catch {
    // Ignore outside of Next.js server request context
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('scan_session')?.value;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie) as UserSessionData;
      let dbUser: any = localDb.getUser(parsed.id) || localDb.findUserByEmail(parsed.email);
      if (!dbUser) {
        try {
          dbUser = await prisma.user.findUnique({ where: { id: parsed.id } });
        } catch {}
      }
      return {
        authUser: { id: parsed.id, email: parsed.email },
        dbUser: dbUser || { nickname: parsed.nickname, avatar: parsed.avatar },
      };
    } catch {}
  }

  // Fallback to Supabase auth check
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const dbUser = localDb.getUser(user.id) || localDb.findUserByEmail(user.email || '');
      return {
        authUser: user,
        dbUser: dbUser || {
          nickname: user.email?.split('@')[0] || 'Hunter',
          avatar: '🐱',
        },
      };
    }
  } catch {}

  return null;
}

export async function logoutUser() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}
  await clearSessionCookie();
  return { success: true };
}

/**
 * Auto-provision or synchronize Google OAuth users in PostgreSQL & local session
 */
export async function syncOAuthUser(authUser: { id: string; email?: string; user_metadata?: Record<string, any> }) {
  const userId = authUser.id;
  const email = (authUser.email || '').toLowerCase().trim();
  const meta = authUser.user_metadata || {};

  // Extract nickname: prefer Google full_name, name, nickname, or email prefix
  const rawNickname =
    meta.full_name ||
    meta.name ||
    meta.nickname ||
    (email ? email.split('@')[0] : 'Hunter');
  const nickname = String(rawNickname).slice(0, 24).trim() || 'Hunter';
  const avatar = 'calico';

  let dbUser: any = null;

  try {
    // 1. Check if user already exists in PostgreSQL
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { pet: true, progress: true },
    });

    if (existingUser) {
      dbUser = existingUser;
    } else {
      // 2. New Google user: Auto-provision User, default Pet (calico), and Progress
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          mode: 'ARASHU',
          nickname,
          avatar,
          progress: {
            create: { xp: 0, level: 1, streak: 0 },
          },
          pet: {
            create: {
              name: 'Scan-chan Jr.',
              stage: 'KITTEN',
              stats: {
                create: { hunger: 50, affection: 10 },
              },
            },
          },
          settings: {
            create: {
              theme: 'default',
              metadata: {
                selectedBorder: 'none',
                selectedAccessory: 'none',
                selectedTitle: '',
                selectedRoom: 'cozy',
              },
            },
          },
          inventory: {
            create: {},
          },
        },
        include: { pet: true, progress: true },
      });
    }
  } catch (prismaErr) {
    console.warn('[syncOAuthUser] Prisma lookup/creation notice:', prismaErr);
  }

  const finalNickname = dbUser?.nickname || nickname;
  const finalAvatar = dbUser?.avatar || avatar;

  // Fallback to local store for offline/serverless resilience
  try {
    const localUser: LocalUser = {
      id: userId,
      email,
      password: '',
      nickname: finalNickname,
      avatar: finalAvatar,
      mode: 'ARASHU',
      progress: { xp: 0, level: 1, streak: 0 },
      pet: {
        name: 'Scan-chan Jr.',
        stage: 'KITTEN',
        stats: { hunger: 50, affection: 10 },
      },
      settings: {
        theme: 'default',
        metadata: {
          selectedBorder: 'none',
          selectedAccessory: 'none',
          selectedTitle: '',
          selectedRoom: 'cozy',
        },
      },
      foodInventory: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localDb.saveUser(localUser);
  } catch {}

  // Set SSR session cookie
  await setSessionCookie({
    id: userId,
    email,
    nickname: finalNickname,
    avatar: finalAvatar,
    mode: 'ARASHU',
  });

  return {
    success: true,
    user: { id: userId, email },
    dbUser,
  };
}
