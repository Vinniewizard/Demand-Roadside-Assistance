import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { 
        userId, 
        businessName, 
        serviceType, 
        latitude, 
        longitude, 
        baseFee, 
        perKmRate 
    } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        businessName,
        serviceType,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        baseFee: parseFloat(baseFee),
        perKmRate: parseFloat(perKmRate),
        isAvailable: true // Mark as ready after setup
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Provider Update Error:', error);
    return NextResponse.json({ error: 'Profiles update failed' }, { status: 500 });
  }
}
