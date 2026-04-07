import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Find the user by email across all roles
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // 2. Validate Identity
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Identity verification failed. Please check your credentials.' }, { status: 401 });
    }

    // 3. Return full profile for dashboard persistence
    return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        licenseNumber: user.licenseNumber || null,
        vehiclePlate: user.vehiclePlate || null,
        businessName: user.businessName || null,
        isApproved: user.isApproved,
        isVerified: user.isVerified
    });
  } catch (error) {
    console.error('Login Auth Error:', error);
    return NextResponse.json({ error: 'Kericho Auth Hub is currently unavailable.' }, { status: 500 });
  }
}
