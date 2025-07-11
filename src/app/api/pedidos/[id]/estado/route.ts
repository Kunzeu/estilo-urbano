import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { estado } = await request.json();
    const id = Number(params.id);
    if (!estado || isNaN(id)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { estado },
    });
    return NextResponse.json({ success: true, pedido });
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    return NextResponse.json({ error: 'Error al actualizar el estado del pedido' }, { status: 500 });
  }
} 