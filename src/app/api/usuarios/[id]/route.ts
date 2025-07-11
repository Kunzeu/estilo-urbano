import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener usuario por ID
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = context.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        createdAt: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT - Editar usuario
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

    const { nombre, email, rol } = await request.json();

    const usuario = await prisma.user.update({
      where: { id },
      data: {
        nombre: nombre || undefined,
        email: email || undefined,
        rol: rol || undefined,
      },
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
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
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

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 