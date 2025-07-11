import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const productos = await prisma.producto.findMany();
    return NextResponse.json(productos);
  } catch {
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const producto = await prisma.producto.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        imagen: data.imagen,
        public_id: data.public_id,
        tallas: data.tallas,
      },
    });
    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 