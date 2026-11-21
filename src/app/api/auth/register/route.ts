import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/auth';
import { registerUser } from '@/services/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid registration data' },
        { status: 400 }
      );
    }

    const result = await registerUser(parsed.data);

    if (!result.success) {
      return NextResponse.json({ success: false, error: (result as any).error ?? 'Registration failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! You are now logged in.',
      user: {
        id: result.user?.id,
        email: result.user?.email,
        nickname: parsed.data.nickname,
        avatar: parsed.data.avatar,
      },
    });
  } catch (error: any) {
    console.error('[API /api/auth/register]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
