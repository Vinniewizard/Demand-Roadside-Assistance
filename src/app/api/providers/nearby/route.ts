import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateDistance } from "@/lib/utils/geo";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: 'Valid coordinates required' }, { status: 400 });
    }

    // Fetch all approved and available providers
    const providers = await prisma.user.findMany({
      where: {
        role: "PROVIDER",
        isApproved: true,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        serviceType: true,
        latitude: true,
        longitude: true,
        baseFee: true,
        perKmRate: true,
      }
    });

    // Calculate distances and sort
    const nearby = providers
      .map(p => {
        // Fallback simulated Kericho coordinates (-0.3689, 35.2863) if null in dev database
        const pLat = p.latitude || (-0.3689 + (Math.random() * 0.05 - 0.025));
        const pLon = p.longitude || (35.2863 + (Math.random() * 0.05 - 0.025));

        const distance = calculateDistance(lat, lon, pLat, pLon);
        return { ...p, distance };
      })
      .filter(p => p.distance < 100) // Within 100km
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Top 5

    return NextResponse.json(nearby);
  } catch (error) {
    console.error('Nearby fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch nearby providers' }, { status: 500 });
  }
}
