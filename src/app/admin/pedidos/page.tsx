"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ESTADOS = [
  { value: "pendiente_pago", label: "Pendiente de pago" },
  { value: "pagado", label: "Pagado" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
];

interface Pedido {
  id: number;
  numero: string;
  email: string;
  nombre: string;
  apellidos: string;
  total: number;
  estado: string;
  fechaCreacion: string;
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/pedidos");
        if (response.ok) {
          const data = await response.json();
          setPedidos(data.pedidos || []);
        }
      } catch {
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const handleEstadoChange = async (pedidoId: number, nuevoEstado: string) => {
    setSavingId(pedidoId);
    setSuccessId(null);
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (response.ok) {
        setPedidos((prev) =>
          prev.map((p) =>
            p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
          )
        );
        setSuccessId(pedidoId);
        setTimeout(() => setSuccessId(null), 1500);
      }
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de pedidos</h1>
        <p className="mb-8 text-gray-600">Panel de administración para gestionar el estado de todos los pedidos.</p>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando pedidos...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6 overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 px-2 font-semibold">Pedido</th>
                  <th className="py-3 px-2 font-semibold">Usuario</th>
                  <th className="py-3 px-2 font-semibold">Estado</th>
                  <th className="py-3 px-2 font-semibold text-right">Total</th>
                  <th className="py-3 px-2 font-semibold">Fecha</th>
                  <th className="py-3 px-2 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-mono">{pedido.numero}</td>
                    <td className="py-3 px-2">{pedido.email}<br /><span className="text-xs text-gray-500">{pedido.nombre} {pedido.apellidos}</span></td>
                    <td className="py-3 px-2">
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={pedido.estado}
                        onChange={e => handleEstadoChange(pedido.id, e.target.value)}
                        disabled={savingId === pedido.id}
                      >
                        {ESTADOS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {savingId === pedido.id && (
                        <span className="ml-2 text-xs text-blue-600 animate-pulse">Guardando...</span>
                      )}
                      {successId === pedido.id && (
                        <span className="ml-2 text-xs text-green-600">¡Guardado!</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      COP {pedido.total.toLocaleString("es-CO")}
                    </td>
                    <td className="py-3 px-2">
                      {new Date(pedido.fechaCreacion).toLocaleDateString('es-CO', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Link href={`/pedidos/${pedido.numero}`}>
                        <Button size="sm" variant="outline">Ver detalles</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 