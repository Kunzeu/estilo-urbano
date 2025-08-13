import { NextResponse } from "next/server";
// import { unlink } from "fs/promises";
// import path from "path";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const usuarioEmail = String(formData.get("usuario") || "");

    const items: Array<{
      color: string;
      talla: string;
      texto: string | null;
      textoColor: string | null;
      imagen: string | null;
      imagenFrente: string | null;
      imagenEspalda: string | null;
    }> = [];

    let i = 0;
    while (formData.has(`personalizaciones[${i}][color]`)) {
      const color = String(formData.get(`personalizaciones[${i}][color]`) || "");
      const talla = String(formData.get(`personalizaciones[${i}][talla]`) || "");
      const texto = (formData.get(`personalizaciones[${i}][texto]`) as string) || null;
      const textoColor = (formData.get(`personalizaciones[${i}][textoColor]`) as string) || null;
      const imagen = formData.get(`personalizaciones[${i}][imagen]`);
      const imagenFrenteFile = formData.get(`personalizaciones[${i}][imagenFrente]`);
      const imagenEspaldaFile = formData.get(`personalizaciones[${i}][imagenEspalda]`);
      let imagenPath: string | null = null;
      let imagenFrentePath: string | null = null;
      let imagenEspaldaPath: string | null = null;

      if (imagen && typeof imagen === "object" && (imagen as File).size > 0) {
        const buffer = Buffer.from(await (imagen as File).arrayBuffer());
        const base64 = buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(`data:${(imagen as File).type};base64,${base64}`, {
          folder: "estilo-urbano/personalizados",
          overwrite: true,
        });
        imagenPath = uploadRes.secure_url;
      }

      if (imagenFrenteFile && typeof imagenFrenteFile === "object" && (imagenFrenteFile as File).size > 0) {
        const buffer = Buffer.from(await (imagenFrenteFile as File).arrayBuffer());
        const base64 = buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(`data:${(imagenFrenteFile as File).type};base64,${base64}`, {
          folder: "estilo-urbano/personalizados",
          overwrite: true,
          public_id: `personalizado_frente_${Date.now()}_${i}`,
        });
        imagenFrentePath = uploadRes.secure_url;
      }

      if (imagenEspaldaFile && typeof imagenEspaldaFile === "object" && (imagenEspaldaFile as File).size > 0) {
        const buffer = Buffer.from(await (imagenEspaldaFile as File).arrayBuffer());
        const base64 = buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(`data:${(imagenEspaldaFile as File).type};base64,${base64}`, {
          folder: "estilo-urbano/personalizados",
          overwrite: true,
          public_id: `personalizado_espalda_${Date.now()}_${i}`,
        });
        imagenEspaldaPath = uploadRes.secure_url;
      }

      items.push({ color, talla, texto, textoColor, imagen: imagenPath, imagenFrente: imagenFrentePath, imagenEspalda: imagenEspaldaPath });
      i++;
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "No hay personalizaciones para guardar" }, { status: 400 });
    }

    // Generar número de pedido de personalización
    const numeroPedido = `PERS-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Buscar usuario opcionalmente por email
    const user = usuarioEmail ? await prisma.user.findUnique({ where: { email: usuarioEmail } }) : null;

    // Validar disponibilidad del modelo en el cliente de Prisma
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaAny = prisma as any;

    // Crear cabecera y líneas
    const pedido = await prismaAny.personalizacionPedido.create({
      data: {
        numero: numeroPedido,
        userId: user?.id ?? null,
        email: usuarioEmail || (user?.email ?? ""),
        estado: "pendiente",
        items: {
          create: items.map((it) => ({
            color: it.color,
            talla: it.talla,
            texto: it.texto,
            textoColor: it.textoColor,
            imagen: it.imagen,
            imagenFrente: it.imagenFrente,
            imagenEspalda: it.imagenEspalda,
            cantidad: 1,
            precio: 40000,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ ok: true, numeroPedido: pedido.numero });
  } catch (error) {
    console.error("Error guardando personalización:", error);
    const message = error instanceof Error ? error.message : "Error al procesar la personalización";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const numero = searchParams.get("numero");
    if (!numero) {
      // Listar todos los pedidos personalizados
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pedidos = await (prisma as any).personalizacionPedido.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
      return NextResponse.json({ pedidos });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedido = await (prisma as any).personalizacionPedido.findFirst({
      where: { numero },
      include: { items: true },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Adaptar respuesta a un esquema similar para la página de instrucciones
    let itemsTotal = 0;
    for (const it of (pedido.items as Array<{ precio: number | null; cantidad: number | null; talla: string }>)) {
      const precio = (it.precio ?? 40000);
      const cantidad = it.cantidad ?? 1;
      itemsTotal += precio * cantidad;
    }
    // Calcular costo de envío: usar el guardado; si no, calcular por ciudad
    const tarifasEnvio: Record<string, number> = { Bogota: 8000, "Bogotá": 8000, Medellin: 9000, "Medellín": 9000, Cali: 9000, Barranquilla: 10000, Cartagena: 10000 };
    let costoEnvio = (pedido as { costoEnvio?: number }).costoEnvio ?? 0;
    if (!costoEnvio) {
      const ciudad = (pedido as { ciudad?: string }).ciudad?.trim() ?? "";
      const key = Object.keys(tarifasEnvio).find(k => k.toLowerCase() === ciudad.toLowerCase());
      costoEnvio = key ? tarifasEnvio[key] : 12000; // default
    }
    const totalFinal = (pedido as { total?: number }).total ?? (itemsTotal + costoEnvio);
    return NextResponse.json({
      pedido: {
        numero: pedido.numero,
        total: totalFinal,
        costoEnvio,
        estado: pedido.estado,
        items: (pedido.items as Array<{ talla: string; cantidad: number; precio: number }>).map((it) => ({
          nombre: `Camiseta personalizada (${it.talla})`,
          cantidad: it.cantidad,
          precio: it.precio ?? 40000,
        })),
      },
      tipo: "personalizado",
    });
  } catch (error) {
    console.error("Error obteniendo pedido personalizado:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const numero = searchParams.get("numero");
    if (!numero) {
      return NextResponse.json({ error: "Número requerido" }, { status: 400 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaAny = prisma as any;
    const pedido = await prismaAny.personalizacionPedido.findFirst({ where: { numero }, include: { items: true } });
    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    // Si se usa Cloudinary, no hay archivos locales que borrar
    // Borrar items primero para evitar restricciones de FK
    await prismaAny.personalizacionItem.deleteMany({ where: { pedidoId: pedido.id } });
    await prismaAny.personalizacionPedido.delete({ where: { id: pedido.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando pedido personalizado:", error);
    const message = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Actualizar datos de checkout del pedido personalizado
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { numero, datosCliente, metodoPago, costoEnvio } = body as {
      numero: string;
      datosCliente?: {
        nombre?: string;
        apellidos?: string;
        direccion?: string;
        telefono?: string;
        ciudad?: string;
        departamento?: string;
      };
      metodoPago?: string;
      costoEnvio?: number;
    };

    if (!numero) {
      return NextResponse.json({ error: "Número requerido" }, { status: 400 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaAny = prisma as any;
    const pedido = await prismaAny.personalizacionPedido.findFirst({ where: { numero }, include: { items: true } });
    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    const items = pedido.items as Array<{ cantidad: number | null; precio: number | null }>;
    const subtotal = items.reduce((acc, it) => acc + (it.precio ?? 40000) * (it.cantidad ?? 1), 0);
    const envio = typeof costoEnvio === 'number' ? costoEnvio : (pedido.costoEnvio ?? 0);
    const total = subtotal + envio;

    const updated = await prismaAny.personalizacionPedido.update({
      where: { id: pedido.id },
      data: {
        nombre: datosCliente?.nombre ?? pedido.nombre,
        apellidos: datosCliente?.apellidos ?? pedido.apellidos,
        direccion: datosCliente?.direccion ?? pedido.direccion,
        telefono: datosCliente?.telefono ?? pedido.telefono,
        ciudad: datosCliente?.ciudad ?? pedido.ciudad,
        departamento: datosCliente?.departamento ?? pedido.departamento,
        metodoPago: metodoPago ?? pedido.metodoPago,
        costoEnvio: envio,
        total,
      },
      include: { items: true },
    });

    return NextResponse.json({ ok: true, pedido: updated });
  } catch (error) {
    console.error('Error actualizando pedido personalizado:', error);
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}