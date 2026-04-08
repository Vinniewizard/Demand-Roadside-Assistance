import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// High-Precision Distance Calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: Request) {
  try {
     const { searchParams } = new URL(req.url);
     const userId = searchParams.get('userId');
     if (!userId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

     const requests = await prisma.assistanceRequest.findMany({
         where: { userId },
         orderBy: { createdAt: 'desc' },
         include: { provider: true }
     });

     return NextResponse.json(requests);
  } catch (err) {
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, serviceType, latitude, longitude, address, fuelType, fuelAmount, description } = await req.json();

    const [user, providers] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { licenseNumber: true, vehiclePlate: true } }),
        prisma.user.findMany({
            where: { role: "PROVIDER", isAvailable: true, isApproved: true, OR: [{ serviceType }, { serviceType: "BOTH" }] },
            select: { id: true, latitude: true, longitude: true, baseFee: true, perKmRate: true, businessName: true }
        })
    ]);

    // if (!user?.licenseNumber || !user?.vehiclePlate) {
    //   return NextResponse.json({ error: "Verification required." }, { status: 403 });
    // }

    let nearestProvider: any = null;
    let minDistance = Infinity;

    for(const p of providers) {
      // Fallback simulated Kericho coordinates (-0.3689, 35.2863) if null in dev database
      const pLat = p.latitude || (-0.3689 + (Math.random() * 0.05 - 0.025));
      const pLon = p.longitude || (35.2863 + (Math.random() * 0.05 - 0.025));

      const dist = calculateDistance(latitude, longitude, pLat, pLon);
      if (dist < minDistance) {
        minDistance = dist;
        nearestProvider = p;
      }
    }

    // Dynamic Financials based on Service Matrix and Distance
    const SERVICE_MATRIX: Record<string, number> = {
        'TOWING': 1500,
        'MECHANICAL': 1000,
        'BATTERY': 800,
        'TYRE': 600,
        'FUEL': 400
    };

    const baseFee = SERVICE_MATRIX[serviceType] || nearestProvider?.baseFee || 500;
    const perKmRate = nearestProvider?.perKmRate || 50;
    const deliveryFee = baseFee + (minDistance !== Infinity ? minDistance * perKmRate : 0);
    
    // ETA PREDICTION: Distance / 40km/h (avg kericho traffic) + buffer
    const travelTime = minDistance !== Infinity ? (minDistance / 40) * 60 : 10;
    const estimatedArrival = Math.round(travelTime + 5); 

    const commissionAmount = Math.round(deliveryFee * 0.10);

    const request = await prisma.assistanceRequest.create({
      data: {
        userId,
        providerId: nearestProvider?.id || null,
        serviceType,
        fuelType,
        fuelAmount,
        description,
        latitude,
        longitude,
        address,
        status: "PENDING",
        deliveryFee: Math.round(deliveryFee),
        commissionAmount,
        estimatedArrival,
      }
    });

    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json({ error: "High-speed dispatch failed" }, { status: 500 });
  }
}
