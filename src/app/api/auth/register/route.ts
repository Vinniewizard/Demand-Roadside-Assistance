import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, role, licenseNumber, vehiclePlate, businessName } = body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production, hash this!
        phone,
        role: role || "MOTORIST",
        licenseNumber,
        vehiclePlate,
        businessName,
        isVerified: !!(licenseNumber && vehiclePlate),
        isApproved: role === "MOTORIST", // Motorists approved by default, Suppliers need Admin
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Registration Error:", error);
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "Email already exists in Kericho Hub." }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
