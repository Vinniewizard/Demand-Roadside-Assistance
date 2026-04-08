import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, isSuspended } = body;

    if (!userId) {
        return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
    }

    // 1. Update the user/supplier's suspension status
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
          isSuspended: Boolean(isSuspended)
      }
    });

    console.log(`[Admin Governance] User ${user.name} suspension status updated to: ${isSuspended}`);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('[Admin Governance] Database Persistence Error:', error);
    return NextResponse.json({ error: 'Database update failed. Check Prisma logs.' }, { status: 500 });
  }
}
