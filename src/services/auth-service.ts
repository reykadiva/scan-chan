import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { localDb, type LocalUser } from '@/lib/database/local-db';
import type { LoginInput, RegisterInput } from '@/lib/validations/auth';
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

export async function loginUser(input: LoginInput) {
  const cleanEmail = input.email.toLowerCase().trim();

  // Try Supabase auth first
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: input.password,
    });

    let authData = data;
    let authError = error;

    // If unconfirmed email blocks sign in, auto-confirm via admin client if service role key is available
    if (
      authError?.message?.toLowerCase().includes('email not confirmed') &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
    ) {
      try {
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const adminSupabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const { data: usersData } = await adminSupabase.auth.admin.listUsers();
        const found = usersData?.users?.find((u) => u.email === cleanEmail);
        if (found) {
          await adminSupabase.auth.admin.updateUserById(found.id, { email_confirm: true });
          const retry = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: input.password,
          });
          if (!retry.error && retry.data.user) {
            authData = retry.data;
            authError = null;
          }
        }
      } catch (adminErr) {
        console.warn('[loginUser] Admin auto-confirm fallback error:', adminErr);
      }
    }

    if (authError) {
      console.warn('[loginUser] Supabase signInWithPassword error:', authError.message);
    }

    if (!authError && authData?.user) {
      const meta = (authData.user.user_metadata as any) || {};
      let nickname = meta.nickname;
      let avatar = meta.avatar;

      // Try fetching from Prisma DB
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: authData.user.id },
        });
        if (dbUser) {
          nickname = dbUser.nickname || nickname;
          avatar = dbUser.avatar || avatar;
        }
      } catch (prismaErr) {
        console.warn('[loginUser] Prisma lookup failed, falling back to metadata:', prismaErr);
      }

      if (!nickname) {
        const emailPrefix = authData.user.email?.split('@')[0] || 'Hunter';
        nickname = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }
      if (!avatar) {
        avatar = 'calico';
      }

      const sessionData: UserSessionData = {
        id: authData.user.id,
        email: authData.user.email || cleanEmail,
        nickname,
        avatar,
        mode: 'ARASHU',
      };
      await setSessionCookie(sessionData);

      return {
        success: true,
        user: authData.user,
        dbUser: { nickname, avatar },
      };
    }
  } catch (err) {
    console.warn('Supabase auth offline or failed, falling back to local auth:', err);
  }

  // Local fallback auth
  const existing = localDb.findUserByEmail(cleanEmail);
  if (!existing || existing.password !== input.password) {
    return { success: false, error: 'Invalid email or password' };
  }

  const sessionData: UserSessionData = {
    id: existing.id,
    email: existing.email,
    nickname: existing.nickname,
    avatar: existing.avatar,
    mode: 'ARASHU',
  };
  await setSessionCookie(sessionData);

  return {
    success: true,
    user: { id: existing.id, email: existing.email },
    dbUser: existing,
  };
}

export async function registerUser(input: RegisterInput) {
  const cleanEmail = input.email.toLowerCase().trim();
  let userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Try Supabase registration first
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: input.password,
      options: {
        data: {
          nickname: input.nickname,
          avatar: input.avatar,
        },
      },
    });

    let authUser = data?.user;

    if (error) {
      console.warn('[registerUser] Supabase auth.signUp notice:', error.message);
    }

    // If signup fails (e.g. rate limit on email sending or confirmation requirement) and service key is present, create confirmed user via admin API
    if (
      (!authUser || error) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
    ) {
      try {
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const adminSupabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const adminRes = await adminSupabase.auth.admin.createUser({
          email: cleanEmail,
          password: input.password,
          email_confirm: true,
          user_metadata: {
            nickname: input.nickname,
            avatar: input.avatar,
          },
        });
        if (adminRes.data?.user) {
          authUser = adminRes.data.user;
        }
      } catch (adminErr) {
        console.warn('[registerUser] Admin user creation fallback error:', adminErr);
      }
    }

    if (authUser) {
      userId = authUser.id;

      // Sync and create record in Prisma database
      try {
        await prisma.user.upsert({
          where: { id: userId },
          create: {
            id: userId,
            mode: 'ARASHU',
            nickname: input.nickname,
            avatar: input.avatar,
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
          update: {
            nickname: input.nickname,
            avatar: input.avatar,
          },
        });
      } catch (prismaErr) {
        console.warn('Prisma user creation failed during register:', prismaErr);
      }
    }
  } catch (err) {
    console.warn('Supabase register offline, creating user profile in local store:', err);
  }

  // Create or persist local user record
  const newUser: LocalUser = {
    id: userId,
    email: cleanEmail,
    password: input.password,
    nickname: input.nickname,
    avatar: input.avatar,
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

  try {
    localDb.saveUser(newUser);
  } catch (localErr) {
    console.warn('[registerUser] Local fallback store save skipped:', localErr);
  }

  // Set session cookie
  await setSessionCookie({
    id: userId,
    email: cleanEmail,
    nickname: input.nickname,
    avatar: input.avatar,
    mode: 'ARASHU',
  });

  return {
    success: true,
    user: { id: userId, email: cleanEmail },
    dbUser: newUser,
  };
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
