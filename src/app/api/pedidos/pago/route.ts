import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { numeroPedido, estadoPago } = body;

    if (!numeroPedido) {
      return NextResponse.json({ error: 'Número de pedido requerido' }, { status: 400 });
    }

    // Buscar el pedido
    const pedido = await prisma.pedido.findFirst({
      where: { numero: numeroPedido },
      include: { items: true }
    });

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Simular procesamiento de pago Nequi
    let nuevoEstado = 'pendiente_pago';
    let mensaje = '';

    switch (estadoPago) {
      case 'exitoso':
        nuevoEstado = 'pagado';
        mensaje = 'Pago procesado exitosamente';
        break;
      case 'pendiente':
        nuevoEstado = 'pendiente_pago';
        mensaje = 'Pago pendiente de confirmación';
        break;
      case 'fallido':
        nuevoEstado = 'pendiente_pago';
        mensaje = 'Pago fallido, intente nuevamente';
        break;
      default:
        nuevoEstado = 'pendiente_pago';
        mensaje = 'Estado de pago no válido';
    }

    // Actualizar el estado del pedido
    const pedidoActualizado = await prisma.pedido.update({
      where: { id: pedido.id },
      data: { estado: nuevoEstado },
      include: { items: true }
    });

    return NextResponse.json({ 
      success: true, 
      pedido: pedidoActualizado,
      mensaje,
      estado: nuevoEstado
    });

  } catch (error) {
    console.error('Error al procesar pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Endpoint para simular la confirmación de pago desde el banco
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { numeroPedido, confirmacionBanco } = body;

    if (!numeroPedido) {
      return NextResponse.json({ error: 'Número de pedido requerido' }, { status: 400 });
    }

    // Buscar el pedido
    const pedido = await prisma.pedido.findFirst({
      where: { numero: numeroPedido }
    });

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Simular confirmación del banco
    const pagoConfirmado = confirmacionBanco === 'confirmado';
    const nuevoEstado = pagoConfirmado ? 'pagado' : 'pendiente_pago';

    // Actualizar el estado del pedido
    const pedidoActualizado = await prisma.pedido.update({
      where: { id: pedido.id },
      data: { estado: nuevoEstado },
      include: { items: true }
    });

    return NextResponse.json({ 
      success: true, 
      pedido: pedidoActualizado,
      pagoConfirmado,
      estado: nuevoEstado
    });

  } catch (error) {
    console.error('Error al confirmar pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 