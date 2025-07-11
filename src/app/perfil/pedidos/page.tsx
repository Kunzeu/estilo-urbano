'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Pedido {
  id: number;
  numero: string;
  total: number;
  estado: string;
  fechaCreacion: string;
}

export default function HistorialPedidosPage() {
  const { data: session, status } = useSession();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!session?.user?.email) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/pedidos?email=${session.user.email}`);
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
    if (session?.user?.email) fetchPedidos();
  }, [session?.user?.email]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial de compras...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión para ver tus pedidos</h1>
          <Link href="/api/auth/signin">
            <Button className="bg-blue-600 hover:bg-blue-700 mt-4">Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis pedidos</h1>
        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <p className="text-gray-600">No tienes pedidos registrados aún.</p>
            <Link href="/productos">
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Ver productos</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 px-2 font-semibold">Pedido</th>
                  <th className="py-3 px-2 font-semibold">Fecha</th>
                  <th className="py-3 px-2 font-semibold">Estado</th>
                  <th className="py-3 px-2 font-semibold text-right">Total</th>
                  <th className="py-3 px-2 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-mono">{pedido.numero}</td>
                    <td className="py-3 px-2">
                      {new Date(pedido.fechaCreacion).toLocaleDateString('es-CO', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {pedido.estado === 'pendiente_pago' ? 'Pendiente de pago' : pedido.estado === 'pagado' ? 'Pagado' : pedido.estado}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      COP {pedido.total.toLocaleString('es-CO')}
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