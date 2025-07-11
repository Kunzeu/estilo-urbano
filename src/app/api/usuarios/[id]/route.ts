import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT - Editar usuario
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    // @ts-expect-error - NextAuth session typing issue
    if (!session?.user?.rol || session.user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    const { nombre, email, rol } = await request.json();

    // Verificar si el usuario existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { id }
    });

    if (!usuarioExistente) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Si se está cambiando el email, verificar que no exista otro usuario con ese email
    if (email && email !== usuarioExistente.email) {
      const emailExistente = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExistente) {
        return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
      }
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.user.update({
      where: { id },
      data: {
        nombre: nombre !== undefined ? nombre : usuarioExistente.nombre,
        email: email || usuarioExistente.email,
        rol: rol || usuarioExistente.rol
      },
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
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    // @ts-expect-error - NextAuth session typing issue
    if (!session?.user?.rol || session.user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    // Verificar si el usuario existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { id }
    });

    if (!usuarioExistente) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // No permitir eliminar el propio usuario admin
    if (session.user.email === usuarioExistente.email) {
      return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 });
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 