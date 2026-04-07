import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, phone, licenseNumber, vehiclePlate } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        licenseNumber,
        vehiclePlate,
        isVerified: !!(licenseNumber && vehiclePlate)
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
