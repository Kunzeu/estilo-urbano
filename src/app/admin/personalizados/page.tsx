"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface PersonalizacionItem {
  id: number;
  talla: string;
  color: string;
  imagen?: string | null;
  imagenFrente?: string | null;
  imagenEspalda?: string | null;
}

interface PersonalizacionPedido {
  id: number;
  numero: string;
  email: string;
  estado: string;
  items: PersonalizacionItem[];
}

export default function PersonalizadosAdminPage() {
  const [pedidos, setPedidos] = useState<PersonalizacionPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/personalizar");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Error al cargar");
        if (isMounted) setPedidos(data.pedidos || []);
      } catch (e) {
        if (isMounted) setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Pedidos Personalizados</h1>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-4">
        {pedidos.map((p) => (
          <div key={p.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.numero}</div>
                <div className="text-sm text-gray-500">{p.email}</div>
                <div className="text-xs text-gray-400">Estado: {p.estado}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    if (!confirm("¿Eliminar este pedido personalizado?")) return;
                    const res = await fetch(`/api/personalizar?numero=${p.numero}`, { method: 'DELETE' });
                    if (res.ok) {
                      setPedidos(prev => prev.filter(x => x.id !== p.id));
                    }
                  }}
                  className="text-red-600 text-sm hover:underline"
                >
                  Eliminar
                </button>
                <Link href={`/pago/instrucciones?pedido=${p.numero}`} className="text-blue-600 text-sm">Ver</Link>
              </div>
            </div>
            <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {p.items.map((it) => (
                <div key={it.id} className="border rounded p-2 text-sm space-y-1">
                  <div className="font-medium">Talla: {it.talla}</div>
                  <div>Color: <span className="inline-block align-middle w-3 h-3 rounded border ml-1" style={{ background: it.color }} /></div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {it.imagenFrente && (
                      <a href={it.imagenFrente} download target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">Descargar frente</a>
                    )}
                    {it.imagenEspalda && (
                      <a href={it.imagenEspalda} download target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">Descargar espalda</a>
                    )}
                    {!it.imagenFrente && !it.imagenEspalda && it.imagen && (
                      <a href={it.imagen} download target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">Descargar imagen</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!loading && pedidos.length === 0 && (
          <div className="text-sm text-gray-500">No hay pedidos personalizados aún.</div>
        )}
      </div>
    </div>
  );
}



