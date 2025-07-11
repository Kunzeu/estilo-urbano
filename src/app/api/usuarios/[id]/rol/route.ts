import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT - Cambiar rol de usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.rol || session.user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    const { rol } = await request.json();

    if (!rol || !["user", "admin"].includes(rol)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // Verificar si el usuario existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { id }
    });

    if (!usuarioExistente) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // No permitir cambiar el rol del propio usuario admin
    if (session.user.email === usuarioExistente.email) {
      return NextResponse.json({ error: "No puedes cambiar tu propio rol" }, { status: 400 });
    }

    // Actualizar rol
    const usuarioActualizado = await prisma.user.update({
      where: { id },
      data: { rol },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true
      }
    });

    return NextResponse.json(usuarioActualizado);
  } catch (error) {
    console.error("Error al cambiar rol:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 