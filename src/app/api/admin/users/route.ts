import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        isAvailable: true,
        isApproved: true,
        isSuspended: true,
        businessName: true,
        licenseNumber: true,
        vehiclePlate: true,
        isVerified: true,
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name, role, phone, licenseNumber, vehiclePlate, businessName, serviceType } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing core fields' }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                email,
                password, // Note: In production this should be hashed
                name,
                role: role || 'Drivers',
                phone: phone || '',
                licenseNumber: licenseNumber || '',
                vehiclePlate: vehiclePlate || '',
                businessName: businessName || '',
                serviceType: serviceType || null,
                isApproved: role === 'PROVIDER' ? true : false, // Admin created providers are pre-approved
                isVerified: true
            }
        });

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error('Admin Create User Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { userId, ...updates } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updates
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Admin Update Error:', error);
        return NextResponse.json({ error: 'Failed to update user registry' }, { status: 500 });
    }
}
