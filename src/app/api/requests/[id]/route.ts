import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { status, isPaid, rating, paymentMethod, latitude, longitude } = body;
    
    // NEXT.JS 15 FIX: Await the dynamic params
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Security: Fetch current request and verify provider approval status if needed
    const currentRequest = await prisma.assistanceRequest.findUnique({
      where: { id },
      include: { provider: true }
    });

    if (!currentRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // If a provider is updating status to ACCEPTED or EN_ROUTE, double-check approval
    if ((status === 'ACCEPTED' || status === 'EN_ROUTE') && currentRequest.providerId) {
      const provider = await prisma.user.findUnique({
        where: { id: currentRequest.providerId }
      });
      if (!provider?.isApproved) {
        return NextResponse.json({ error: 'Assigned supplier is not yet certified by Kericho Hub.' }, { status: 403 });
      }
    }

    const updatedRequest = await prisma.assistanceRequest.update({
      where: { id },
      data: { 
          status,
          isPaid,
          rating,
          paymentMethod,
          ...(latitude !== undefined ? { latitude } : {}),
          ...(longitude !== undefined ? { longitude } : {}),
          acceptedAt: status === 'ACCEPTED' ? new Date() : undefined,
          completedAt: status === 'COMPLETED' ? new Date() : undefined
      },
      include: { user: true, provider: true }
    });

    if (status === 'COMPLETED' && isPaid && updatedRequest.providerId && updatedRequest.deliveryFee) {
        const netProviderEarnings = updatedRequest.deliveryFee - (updatedRequest.commissionAmount || 0);
        await prisma.user.update({
            where: { id: updatedRequest.providerId },
            data: {
                revenueEarned: { increment: netProviderEarnings }
            }
        });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Finalization Error:', error);
    return NextResponse.json({ error: 'System finalization failed' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const request = await prisma.assistanceRequest.findUnique({
            where: { id: resolvedParams.id },
            include: { user: true, provider: true }
        });
        return NextResponse.json(request);
    } catch (err) {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
