import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, phone, licenseNumber, vehiclePlate, idNumber, latitude, longitude } = body;

    if (!userId) {
        return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
          ...(phone ? { phone } : {}),
          ...(licenseNumber ? { licenseNumber } : {}),
          ...(vehiclePlate ? { vehiclePlate } : {}),
          ...(idNumber ? { idNumber } : {}),
          ...(latitude !== undefined ? { latitude } : {}),
          ...(longitude !== undefined ? { longitude } : {})
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
