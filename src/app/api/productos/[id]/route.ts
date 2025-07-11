import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// GET - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
    }

    const producto = await prisma.producto.findUnique({
      where: { id: productId }
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
    }

    const { nombre, descripcion, precio, imagen, tallas, public_id } = await request.json();

    // Verificar si el producto existe
    const productoExistente = await prisma.producto.findUnique({
      where: { id: productId }
    });

    if (!productoExistente) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Actualizar producto
    const productoActualizado = await prisma.producto.update({
      where: { id: productId },
      data: {
        nombre: nombre || productoExistente.nombre,
        descripcion: descripcion !== undefined ? descripcion : productoExistente.descripcion,
        precio: precio || productoExistente.precio,
        imagen: imagen !== undefined ? imagen : productoExistente.imagen,
        public_id: public_id !== undefined ? public_id : productoExistente.public_id,
        tallas: tallas || productoExistente.tallas
      }
    });

    return NextResponse.json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
    }

    // Verificar si el producto existe
    const productoExistente = await prisma.producto.findUnique({
      where: { id: productId }
    });

    if (!productoExistente) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Eliminar imagen de Cloudinary si existe public_id
    if (productoExistente.public_id) {
      try {
        await cloudinary.uploader.destroy(productoExistente.public_id);
      } catch (err) {
        console.error("Error al eliminar imagen de Cloudinary:", err);
      }
    }

    // Eliminar producto
    await prisma.producto.delete({
      where: { id: productId }
    });

    return NextResponse.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 