import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, nombre } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 });
    }
    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    
    // Verificar si es el primer usuario (será admin)
    const userCount = await prisma.user.count();
    const rol = userCount === 0 ? "admin" : "user";
    
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        nombre,
        provider: "credentials",
        rol,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error al registrar usuario", details: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 });
  }
} 