import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Por ahora, vamos a obtener el usuario directamente de la base de datos
    // En una implementación real, verificarías el token JWT
    const users = await prisma.user.findMany({
      take: 1,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      user: {
        id: String(user.id),
        name: user.nombre || 'Usuario',
        email: user.email,
        role: user.rol,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 