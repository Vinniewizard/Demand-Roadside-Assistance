import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, isApproved } = body;

    if (!userId) {
        return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
    }

    // 1. Explicitly update the supplier's approval status in the DB
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
          isApproved: Boolean(isApproved),
          isAvailable: Boolean(isApproved) // Enable dispatching upon approval
      }
    });

    console.log(`[Admin Dispatch Hub] Supplier ${user.name} status updated to: ${isApproved}`);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('[Admin Dispatch Hub] Database Persistence Error:', error);
    return NextResponse.json({ error: 'Database update failed. Check Prisma logs.' }, { status: 500 });
  }
}
