import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // @ts-expect-error - NextAuth session typing issue
    if (!session?.user?.rol || session.user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // @ts-expect-error - NextAuth session typing issue
    if (!session?.user?.rol || session.user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { nombre, email, password, rol } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await prisma.user.create({
      data: {
        nombre: nombre || null,
        email,
        password: hashedPassword,
        rol: rol || "user"
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true
      }
    });

    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 