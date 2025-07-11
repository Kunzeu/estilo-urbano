import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener producto por ID
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
    }
    const producto = await prisma.producto.findUnique({
      where: { id: productId },
    });
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT - Editar producto
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
    }
    const data = await request.json();
    const producto = await prisma.producto.update({
      where: { id: productId },
      data,
    });
    return NextResponse.json(producto);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
    }
    
    // Verificar que el producto existe antes de eliminarlo
    const productoExistente = await prisma.producto.findUnique({
      where: { id: productId },
    });
    
    if (!productoExistente) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    
    await prisma.producto.delete({
      where: { id: productId },
    });
    
    return NextResponse.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 