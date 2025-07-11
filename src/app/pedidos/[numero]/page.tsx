'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Package, Phone, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PedidoItem {
  id: number;
  productoId: number;
  nombre: string;
  talla: string;
  cantidad: number;
  precio: number;
  imagen?: string | null;
}

interface Pedido {
  id: number;
  numero: string;
  email: string;
  nombre: string;
  apellidos: string;
  direccion: string;
  telefono: string;
  ciudad: string;
  departamento: string;
  total: number;
  costoEnvio: number;
  metodoPago: string;
  estado: string;
  fechaCreacion: string;
  items: PedidoItem[];
}

export default function PedidoDetallePage() {
  const params = useParams();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const numeroPedido = params.numero as string;
        
        // Buscar el pedido por número
        const response = await fetch(`/api/pedidos?numero=${numeroPedido}`);
        
        if (!response.ok) {
          throw new Error('Pedido no encontrado');
        }
        
        const data = await response.json();
        setPedido(data.pedido);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    if (params.numero) {
      fetchPedido();
      
      // Actualizar el estado del pedido cada 5 segundos para mostrar cambios en tiempo real
      const interval = setInterval(fetchPedido, 5000);
      
      return () => clearInterval(interval);
    }
  }, [params.numero]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Package size={48} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido no encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'No se pudo encontrar la información del pedido.'}</p>
          <Link href="/carrito" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Volver al carrito
          </Link>
        </div>
      </div>
    );
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente_pago':
        return 'bg-yellow-100 text-yellow-800';
      case 'pagado':
        return 'bg-green-100 text-green-800';
      case 'enviado':
        return 'bg-blue-100 text-blue-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente_pago':
        return 'Pendiente de pago';
      case 'pagado':
        return 'Pagado';
      case 'enviado':
        return 'Enviado';
      case 'entregado':
        return 'Entregado';
      default:
        return estado;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <Link href="/perfil/pedidos" className="inline-flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a mis pedidos
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Detalles del Pedido</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Detalles del pedido */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Pedido</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Número de pedido:</span>
                  <span className="font-semibold text-gray-900">{pedido.numero}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(pedido.fechaCreacion).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(pedido.estado)}`}>
                    {getEstadoTexto(pedido.estado)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Método de pago:</span>
                  <span className="font-semibold text-gray-900">
                    {pedido.metodoPago === 'transferencia' ? 'Nequi' : pedido.metodoPago}
                  </span>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
              <div className="space-y-3">
                {pedido.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.nombre}</p>
                      <p className="text-sm text-gray-500">Talla: {item.talla} | Cantidad: {item.cantidad}</p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      COP {(item.precio * item.cantidad).toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">{pedido.telefono}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección de entrega</p>
                    <p className="font-medium text-gray-900">
                      {pedido.direccion}<br />
                      {pedido.ciudad}, {pedido.departamento}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">COP {(pedido.total - pedido.costoEnvio).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-medium">COP {pedido.costoEnvio.toLocaleString('es-CO')}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">COP {pedido.total.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximos pasos */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Próximos pasos</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <p>Recibirás una confirmación por WhatsApp en las próximas 24 horas</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <p>Tu pedido será procesado y enviado en 2-3 días hábiles</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <p>Recibirás actualizaciones sobre el estado de tu envío</p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Link href="/productos">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Continuar comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 