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
    // SC-001 Hardening: Legacy scan_session is no longer an identity authority.
    // Expire and remove any existing scan_session cookie from the browser.
    cookieStore.delete('scan_session');
    cookieStore.set('scan_session', '', {
      path: '/',
      maxAge: 0,
    });
    // Set non-sensitive UI mode preference
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
    cookieStore.set('scan_session', '', { path: '/', maxAge: 0 });
    cookieStore.set('scan_mode', '', { path: '/', maxAge: 0 });
  } catch {
    // Ignore outside of Next.js server request context
  }
}

/**
 * Lightweight helper to retrieve authenticated Supabase User ID without extra DB lookups
 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user.id;
  } catch {
    return null;
  }
}

/**
 * SC-001: Verified identity lookup using Supabase server client as the sole authority.
 * Never trusts unverified client cookies (scan_session).
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    let dbUser: any = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { progress: true, pet: true },
      });
    } catch (prismaErr) {
      console.warn('[getCurrentUser] Prisma user lookup notice:', prismaErr);
    }

    if (!dbUser) {
      dbUser = localDb.getUser(user.id) || localDb.findUserByEmail(user.email || '');
    }

    const nickname =
      dbUser?.nickname ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Hunter';

    const avatar = dbUser?.avatar || user.user_metadata?.avatar || 'calico';

    return {
      authUser: user,
      dbUser: dbUser || {
        nickname,
        avatar,
      },
    };
  } catch (err) {
    console.error('[getCurrentUser] Error verifying Supabase auth session:', err);
    return null;
  }
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
                create: { hunger: 80, affection: 80 },
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
                lastFedAt: Date.now(),
                lastHungerDecayAt: Date.now(),
                lastAffectionDecayAt: Date.now(),
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
    const existingLocal = localDb.getUser(userId) || localDb.findUserByEmail(email);
    const localUser: LocalUser = {
      id: userId,
      email,
      password: '',
      nickname: existingLocal?.nickname || finalNickname,
      avatar: existingLocal?.avatar || finalAvatar,
      mode: 'ARASHU',
      progress: existingLocal?.progress || { xp: 0, level: 1, streak: 0 },
      pet: existingLocal?.pet || {
        name: 'Scan-chan Jr.',
        stage: 'KITTEN',
        stats: { hunger: 80, affection: 80 },
      },
      settings: existingLocal?.settings || {
        theme: 'default',
        metadata: {
          selectedBorder: 'none',
          selectedAccessory: 'none',
          selectedTitle: '',
          selectedRoom: 'cozy',
          lastFedAt: Date.now(),
          lastHungerDecayAt: Date.now(),
          lastAffectionDecayAt: Date.now(),
        },
      },
      foodInventory: existingLocal?.foodInventory || {},
      createdAt: existingLocal?.createdAt || new Date().toISOString(),
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
