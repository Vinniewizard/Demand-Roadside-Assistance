import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [totalUsers, totalRequests, activeProviders, pendingRequests, requestsData] = await Promise.all([
      prisma.user.count(),
      prisma.assistanceRequest.count(),
      prisma.user.count({ where: { role: 'PROVIDER', isApproved: true } }),
      prisma.assistanceRequest.count({ where: { status: 'PENDING' } }),
      prisma.assistanceRequest.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { 
            user: { select: { name: true, vehiclePlate: true, licenseNumber: true, phone: true } }, 
            provider: { select: { businessName: true, name: true, phone: true } } 
        }
      })
    ]);

    // Added type-safe aggregation with proper null checks
    const financialData = await prisma.assistanceRequest.aggregate({
        _sum: {
            deliveryFee: true,
            commissionAmount: true
        }
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalRequests,
        activeProviders,
        pendingRequests,
        netVolume: financialData?._sum?.deliveryFee || 0,
        totalCommission: financialData?._sum?.commissionAmount || 0
      },
      requests: requestsData,
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ error: 'Stats unavailable' }, { status: 500 });
  }
}
