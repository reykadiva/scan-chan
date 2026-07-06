import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        progress: true,
        pet: {
          include: { stats: true },
        },
        settings: true,
      },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          nickname: 'Arashu',
          avatar: '👑',
          progress: {
            create: {
              xp: 0,
              level: 1,
              streak: 0,
            },
          },
          pet: {
            create: {
              name: 'Scan-chan Jr.',
              stage: 'KITTEN',
              stats: {
                create: {
                  hunger: 50,
                  affection: 10,
                  mood: 100,
                  energy: 100,
                },
              },
            },
          },
          settings: {
            create: {
              theme: 'default:none:none:',
              sound: true,
            },
          },
        },
        include: {
          progress: true,
          pet: {
            include: { stats: true },
          },
          settings: true,
        },
      });
    }

    const themeString = dbUser.settings?.theme || 'default:none:none:';
    const [t, b, a, titleVal] = themeString.split(':');

    return NextResponse.json({
      success: true,
      data: {
        nickname: dbUser.nickname || 'Arashu',
        avatar: dbUser.avatar || '👑',
        xp: dbUser.progress?.xp ?? 0,
        level: dbUser.progress?.level ?? 1,
        streak: dbUser.progress?.streak ?? 0,
        petName: dbUser.pet?.name ?? 'Scan-chan Jr.',
        petStage: dbUser.pet?.stage ?? 'KITTEN',
        petHunger: dbUser.pet?.stats?.hunger ?? 50,
        petAffection: dbUser.pet?.stats?.affection ?? 10,
        selectedTheme: t || 'default',
        selectedBorder: b || 'none',
        selectedAccessory: a || 'none',
        selectedTitle: titleVal || '',
      },
    });
  } catch (error) {
    console.error('[GET /api/profile]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      xp,
      level,
      streak,
      petName,
      petStage,
      petHunger,
      petAffection,
      selectedTheme,
      selectedBorder,
      selectedAccessory,
      selectedTitle,
    } = body;

    const themeString = `${selectedTheme || 'default'}:${selectedBorder || 'none'}:${selectedAccessory || 'none'}:${selectedTitle || ''}`;

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        progress: {
          upsert: {
            create: { xp: xp ?? 0, level: level ?? 1, streak: streak ?? 0 },
            update: { xp: xp ?? 0, level: level ?? 1, streak: streak ?? 0 },
          },
        },
        pet: {
          upsert: {
            create: {
              name: petName || 'Scan-chan Jr.',
              stage: petStage || 'KITTEN',
              stats: {
                create: {
                  hunger: petHunger ?? 50,
                  affection: petAffection ?? 10,
                },
              },
            },
            update: {
              name: petName || 'Scan-chan Jr.',
              stage: petStage || 'KITTEN',
              stats: {
                upsert: {
                  create: { hunger: petHunger ?? 50, affection: petAffection ?? 10 },
                  update: { hunger: petHunger ?? 50, affection: petAffection ?? 10 },
                },
              },
            },
          },
        },
        settings: {
          upsert: {
            create: { theme: themeString },
            update: { theme: themeString },
          },
        },
      },
      create: {
        id: user.id,
        nickname: 'Arashu',
        avatar: '👑',
        progress: {
          create: { xp: xp ?? 0, level: level ?? 1, streak: streak ?? 0 },
        },
        pet: {
          create: {
            name: petName || 'Scan-chan Jr.',
            stage: petStage || 'KITTEN',
            stats: {
              create: {
                hunger: petHunger ?? 50,
                affection: petAffection ?? 10,
              },
            },
          },
        },
        settings: {
          create: { theme: themeString },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/profile]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
