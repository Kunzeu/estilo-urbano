import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Interfaz para el tipo de producto en el carrito
interface ProductoCarrito {
  id: number;
  nombre: string;
  talla: string;
  cantidad: number;
  precio: number;
  imagen?: string | null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      productos, 
      datosCliente, 
      total, 
      costoEnvio,
      metodoPago,
      email // Recibir email desde el frontend
    } = body;

    // Validaciones
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }
    if (!productos || productos.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
    }
    if (!datosCliente.nombre || !datosCliente.apellidos || !datosCliente.direccion || 
        !datosCliente.telefono || !datosCliente.ciudad || !datosCliente.departamento) {
      return NextResponse.json({ error: 'Datos de cliente incompletos' }, { status: 400 });
    }

    // Generar número de pedido único
    const numeroPedido = `PED-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Buscar usuario por email (opcional)
    const user = await prisma.user.findUnique({ where: { email } });

    // Guardar el pedido y sus items
    const pedido = await prisma.pedido.create({
      data: {
        numero: numeroPedido,
        userId: user?.id || null,
        email,
        nombre: datosCliente.nombre,
        apellidos: datosCliente.apellidos,
        direccion: datosCliente.direccion,
        telefono: datosCliente.telefono,
        ciudad: datosCliente.ciudad,
        departamento: datosCliente.departamento,
        total,
        costoEnvio,
        metodoPago,
        estado: 'pendiente_pago',
        items: {
          create: productos.map((item: ProductoCarrito) => ({
            productoId: item.id,
            nombre: item.nombre,
            talla: item.talla,
            cantidad: item.cantidad,
            precio: item.precio,
            imagen: item.imagen || null
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json({ 
      success: true, 
      numeroPedido: pedido.numero,
      pedido
    });

  } catch (error) {
    console.error('Error al procesar pedido:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const numero = searchParams.get('numero');

    // Si se proporciona un número de pedido, buscar ese pedido específico
    if (numero) {
      const pedido = await prisma.pedido.findFirst({
        where: { numero },
        include: { items: true }
      });

      if (!pedido) {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
      }

      return NextResponse.json({ pedido });
    }

    // Si se proporciona email, buscar todos los pedidos del usuario
    if (email) {
      const pedidos = await prisma.pedido.findMany({
        where: { email },
        include: { items: true },
        orderBy: { fechaCreacion: 'desc' }
      });

      return NextResponse.json({ pedidos });
    }

    // Si no se proporciona email ni número, devolver todos los pedidos (para admin)
    const pedidos = await prisma.pedido.findMany({
      include: { items: true },
      orderBy: { fechaCreacion: 'desc' }
    });
    return NextResponse.json({ pedidos });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 