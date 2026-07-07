import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { calculateStreakMultiplier } from '@/lib/streak-multiplier';

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
        inventory: {
          include: { items: true },
        },
      },
    });

    if (!dbUser) {
      // Generate unique nickname from user email or ID
      const email = user.email || '';
      const emailUsername = email.split('@')[0] || user.id.substring(0, 8);
      const nickname = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          nickname,
          avatar: '👑',
          mode: 'GUEST', // Default to GUEST mode, will be updated when user logs in
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
                },
              },
            },
          },
          settings: {
            create: {
              theme: 'default:none:none::cozy::{}',
              sound: true,
            },
          },
          inventory: {
            create: {},
          },
        },
        include: {
          progress: true,
          pet: {
            include: { stats: true },
          },
          settings: true,
          inventory: {
            include: { items: true },
          },
        },
      });
    }

    const themeString = dbUser.settings?.theme || 'default:none:none::cozy::{}';
    const [t, b, a, titleVal, room, calendarStr, categoriesStr, nightStr] = themeString.split(':');

    let loginCalendar: string[] = [];
    if (calendarStr) {
      loginCalendar = calendarStr.split(',').filter(Boolean);
    }

    let categoryScans: Record<string, number> = {};
    if (categoriesStr) {
      try {
        categoryScans = JSON.parse(categoriesStr.replace(/;/g, ':'));
      } catch {}
    }

    // Load food inventory from database
    let foodInventory: Record<string, number> = {};
    if (dbUser.inventory) {
      const foodItems = await prisma.inventoryItem.findMany({
        where: {
          inventoryId: dbUser.inventory.id,
          type: 'FOOD',
        },
      });
      
      for (const item of foodItems) {
        foodInventory[item.itemKey] = item.quantity;
      }
    }

    // Parse additional data from settings metadata
    let registeredBarcodes: string[] = [];
    let scanHistory: string[] = [];
    let dailyMissions: any[] = [];
    let activeBounty: any = null;

    if (dbUser.settings?.metadata) {
      const metadata = dbUser.settings.metadata as any;
      registeredBarcodes = metadata.registeredBarcodes || [];
      scanHistory = metadata.scanHistory || [];
      dailyMissions = metadata.dailyMissions || [];
      activeBounty = metadata.activeBounty || null;
    }

    const nightScans = nightStr ? parseInt(nightStr) : 0;
    const currentStreak = dbUser.progress?.streak ?? 0;
    const streakMultiplier = calculateStreakMultiplier(currentStreak);

    console.log('📖 [API GET /api/profile] Reading from database:', {
      petHunger: dbUser.pet?.stats?.hunger,
      petAffection: dbUser.pet?.stats?.affection,
      petStage: dbUser.pet?.stage,
      petStatsExists: !!dbUser.pet?.stats,
      userId: user.id,
    });

    // CRITICAL: Use the ACTUAL values from database, don't fallback to defaults
    // This was causing stats to reset on refresh!
    const actualHunger = dbUser.pet?.stats?.hunger;
    const actualAffection = dbUser.pet?.stats?.affection;
    
    console.log('🔢 [API GET /api/profile] Preparing response:', {
      actualHunger,
      actualAffection,
      willReturnHunger: actualHunger ?? 50,
      willReturnAffection: actualAffection ?? 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        nickname: dbUser.nickname || 'Arashu',
        avatar: dbUser.avatar || '👑',
        xp: dbUser.progress?.xp ?? 0,
        level: dbUser.progress?.level ?? 1,
        streak: currentStreak,
        streakMultiplier,
        petName: dbUser.pet?.name ?? 'Scan-chan Jr.',
        petStage: dbUser.pet?.stage ?? 'KITTEN',
        petHunger: dbUser.pet?.stats?.hunger ?? 50,
        petAffection: dbUser.pet?.stats?.affection ?? 10,
        foodInventory,
        selectedTheme: t || 'default',
        selectedBorder: b || 'none',
        selectedAccessory: a || 'none',
        selectedTitle: titleVal || '',
        selectedRoom: room || 'cozy',
        loginCalendar,
        categoryScans,
        nightScans,
        registeredBarcodes,
        scanHistory,
        dailyMissions,
        activeBounty,
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
    
    console.log('📥 [API POST /api/profile] Received payload:', {
      petHunger: body.petHunger,
      petAffection: body.petAffection,
      petStage: body.petStage,
      userId: user.id,
    });
    
    const {
      xp,
      level,
      streak,
      petName,
      petStage,
      petHunger,
      petAffection,
      foodInventory,
      selectedTheme,
      selectedBorder,
      selectedAccessory,
      selectedTitle,
      selectedRoom,
      loginCalendar,
      categoryScans,
      nightScans,
      registeredBarcodes,
      scanHistory,
      dailyMissions,
      activeBounty,
    } = body;
    
    console.log('🔢 [API POST /api/profile] Extracted values:', {
      petHunger,
      petAffection,
      petStage,
      typeofHunger: typeof petHunger,
      typeofAffection: typeof petAffection,
    });

    const calendarStr = Array.isArray(loginCalendar) ? loginCalendar.join(',') : '';
    const categoriesStr = categoryScans ? JSON.stringify(categoryScans).replace(/:/g, ';') : '{}';

    const themeString = `${selectedTheme || 'default'}:${selectedBorder || 'none'}:${selectedAccessory || 'none'}:${selectedTitle || ''}:${selectedRoom || 'cozy'}:${calendarStr}:${categoriesStr}:${nightScans || 0}`;

    // Store additional data in settings metadata
    const metadata = {
      registeredBarcodes: registeredBarcodes || [],
      scanHistory: scanHistory || [],
      dailyMissions: dailyMissions || [],
      activeBounty: activeBounty || null,
    };

    // Log what we're about to write
    console.log('💾 [API POST /api/profile] Writing to database:', {
      petHunger: typeof petHunger === 'number' ? petHunger : 50,
      petAffection: typeof petAffection === 'number' ? petAffection : 10,
      petStage: petStage || 'KITTEN',
    });
    
    // Upsert user with pet and progress
    const updatedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        mode: 'ARASHU', // Ensure mode is set to ARASHU
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
                  hunger: typeof petHunger === 'number' ? petHunger : 50,
                  affection: typeof petAffection === 'number' ? petAffection : 10,
                },
              },
            },
            update: {
              name: petName || 'Scan-chan Jr.',
              stage: petStage || 'KITTEN',
              stats: {
                upsert: {
                  create: { 
                    hunger: typeof petHunger === 'number' ? petHunger : 50, 
                    affection: typeof petAffection === 'number' ? petAffection : 10 
                  },
                  update: { 
                    hunger: typeof petHunger === 'number' ? petHunger : 50, 
                    affection: typeof petAffection === 'number' ? petAffection : 10 
                  },
                },
              },
            },
          },
        },
        settings: {
          upsert: {
            create: { theme: themeString, metadata },
            update: { theme: themeString, metadata },
          },
        },
        inventory: {
          upsert: {
            create: {},
            update: {},
          },
        },
      },
      create: {
        id: user.id,
        nickname: user.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : user.id.substring(0, 8),
        avatar: '👑',
        mode: 'ARASHU',
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
          create: { theme: themeString, metadata },
        },
        inventory: {
          create: {},
        },
      },
      include: {
        inventory: true,
      },
    });

    // Save food inventory to database
    if (updatedUser.inventory && foodInventory) {
      // Delete all existing food items first
      await prisma.inventoryItem.deleteMany({
        where: {
          inventoryId: updatedUser.inventory.id,
          type: 'FOOD',
        },
      });

      // Insert new food items
      const foodEntries = Object.entries(foodInventory as Record<string, number>);
      if (foodEntries.length > 0) {
        await prisma.inventoryItem.createMany({
          data: foodEntries.map(([barcode, quantity]) => ({
            inventoryId: updatedUser.inventory!.id,
            type: 'FOOD' as const,
            itemKey: barcode,
            quantity,
          })),
        });
      }
    }

    // Verify what was written by reading it back
    const verifyUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        pet: {
          include: { stats: true },
        },
      },
    });
    
    console.log('✅ [API POST /api/profile] Verification - Data in DB after write:', {
      petHunger: verifyUser?.pet?.stats?.hunger,
      petAffection: verifyUser?.pet?.stats?.affection,
      petStage: verifyUser?.pet?.stage,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [POST /api/profile] Error:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    
    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('   Prisma error code:', (error as any).code);
      console.error('   Prisma error meta:', (error as any).meta);
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
