"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartContext";

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  tallas: string;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalImagen, setModalImagen] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<number | null>(null);
  const [selectedTallas, setSelectedTallas] = useState<{ [id: number]: string[] }>({});
  const [disabledIds, setDisabledIds] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    fetch("/api/productos")
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar productos:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Cargando productos...</p></div>;
  }

  if (productos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Productos</h1>
          <p className="text-lg text-gray-600">No hay productos disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 px-2 sm:px-0">
        {productos.map(producto => {
          const tallas = JSON.parse(producto.tallas || "[]");
          const tallasSeleccionadas = selectedTallas[producto.id] || [];
          
          // Si no hay tallas, usar "Única" como opción por defecto
          const tallasDisponibles = tallas.length > 0 ? tallas : ["Única"];
          
          const handleTallaClick = (talla: string) => {
            setSelectedTallas(prev => {
              const current = prev[producto.id] || [];
              if (current.includes(talla)) {
                return { ...prev, [producto.id]: current.filter(t => t !== talla) };
              } else {
                return { ...prev, [producto.id]: [...current, talla] };
              }
            });
          };
          
          return (
            <div key={producto.id} className="bg-white rounded shadow p-3 sm:p-4 flex flex-col items-center w-full max-w-xs mx-auto">
              {producto.imagen && (
                <div className="flex justify-center mb-3 w-full">
                  <Image 
                    src={producto.imagen} 
                    alt={producto.nombre} 
                    width={320} 
                    height={320} 
                    className="w-full max-w-[220px] h-auto object-cover rounded-lg border-2 border-gray-200 shadow-lg cursor-pointer" 
                    onClick={() => setModalImagen(producto.imagen || "")}
                  />
                </div>
              )}
              <h2 className="font-bold text-base sm:text-lg mb-1 text-center break-words">{producto.nombre}</h2>
              <p className="text-gray-500 mb-2 text-center text-sm sm:text-base">COP {producto.precio.toLocaleString("es-CO", {minimumFractionDigits:2})}</p>
              {producto.descripcion && <p className="text-xs sm:text-sm text-gray-600 mb-2 text-center break-words">{producto.descripcion}</p>}
              
              {/* Botones de tallas */}
              <div className="w-full mb-3">
                <label className="block text-xs sm:text-sm font-medium mb-2">Tallas:</label>
                <div className="flex flex-wrap gap-2">
                  {tallasDisponibles.map((talla: string) => (
                    <button
                      key={talla}
                      type="button"
                      onClick={() => handleTallaClick(talla)}
                      className={`px-4 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors border shadow-sm text-center select-none
                        ${tallasSeleccionadas.includes(talla)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'}
                      `}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
                {tallasSeleccionadas.length > 0 && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    ✓ {tallasSeleccionadas.length} {tallasSeleccionadas.length === 1 ? 'talla' : 'tallas'} seleccionada{tallasSeleccionadas.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              <button
                className={`bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition w-full mt-auto ${addedId === producto.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => {
                  if (tallasDisponibles.length > 1 && tallasSeleccionadas.length === 0) {
                    alert("Por favor selecciona al menos una talla");
                    return;
                  }
                  
                  // Agregar cada talla seleccionada al carrito
                  tallasSeleccionadas.forEach(talla => {
                    addToCart({
                      id: producto.id,
                      nombre: producto.nombre,
                      precio: producto.precio,
                      imagen: producto.imagen,
                      talla: talla,
                    });
                  });
                  
                  setAddedId(producto.id);
                  setDisabledIds(ids => ({ ...ids, [producto.id]: true }));
                  setTimeout(() => {
                    setAddedId(null);
                    setDisabledIds(ids => ({ ...ids, [producto.id]: false }));
                    // Limpiar las tallas seleccionadas después de agregar al carrito
                    setSelectedTallas(prev => {
                      const newState = { ...prev };
                      delete newState[producto.id];
                      return newState;
                    });
                  }, 1200);
                }}
                disabled={!!disabledIds[producto.id]}
              >
                {addedId === producto.id 
                  ? tallasSeleccionadas.length > 1 
                    ? `¡${tallasSeleccionadas.length} tallas agregadas!` 
                    : '¡Agregado!' 
                  : 'Agregar al carrito'
                }
              </button>
            </div>
          );
        })}
      </div>
      {/* Modal de imagen */}
      {modalImagen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[200]" onClick={() => setModalImagen(null)}>
          <Image src={modalImagen} alt="Imagen grande" width={800} height={800} className="w-full max-w-xs sm:max-w-2xl max-h-[70vh] sm:max-h-[90vh] rounded-lg shadow-2xl border-4 border-white object-contain" />
        </div>
      )}
    </div>
  );
} 