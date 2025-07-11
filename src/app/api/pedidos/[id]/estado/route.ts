import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { estado } = await request.json();
    const { id } = await params;
    const pedidoId = Number(id);
    if (!estado || isNaN(pedidoId)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const pedido = await prisma.pedido.update({
      where: { id: pedidoId },
      data: { estado },
    });
    return NextResponse.json({ success: true, pedido });
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    return NextResponse.json({ error: 'Error al actualizar el estado del pedido' }, { status: 500 });
  }
} 