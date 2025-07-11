import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Cambiar rol de usuario
export async function PUT(
  request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const id = parseInt(context.params.id);
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    const { rol } = await request.json();

    if (!rol || !["user", "admin"].includes(rol)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    const usuario = await prisma.user.update({
      where: { id },
      data: { rol },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        createdAt: true,
      },
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error al cambiar rol de usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 