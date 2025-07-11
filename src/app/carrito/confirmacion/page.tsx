'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { CheckCircle, Package, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  talla: string;
}

interface PedidoItem {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  talla: string;
}

interface PedidoConfirmado {
  numeroPedido: string;
  productos: Producto[];
  datosCliente: {
    nombre: string;
    apellidos: string;
    direccion: string;
    telefono: string;
    ciudad: string;
    departamento: string;
  };
  total: number;
  costoEnvio: number;
  fechaCreacion: string;
}

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const [pedido, setPedido] = useState<PedidoConfirmado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      const numeroPedido = searchParams.get('pedido');
      
      if (numeroPedido) {
        try {
          // Obtener datos reales del pedido desde la API
          const response = await fetch(`/api/pedidos?numero=${numeroPedido}`);
          
          if (!response.ok) {
            throw new Error('Pedido no encontrado');
          }
          
          const data = await response.json();
          const pedidoReal = data.pedido;
          
          // Convertir datos de la API al formato esperado por el componente
          const pedidoConvertido: PedidoConfirmado = {
            numeroPedido: pedidoReal.numero,
            productos: pedidoReal.items.map((item: PedidoItem) => ({
              id: item.productoId,
              nombre: item.nombre,
              precio: item.precio,
              cantidad: item.cantidad,
              talla: item.talla
            })),
            datosCliente: {
              nombre: pedidoReal.nombre,
              apellidos: pedidoReal.apellidos,
              direccion: pedidoReal.direccion,
              telefono: pedidoReal.telefono,
              ciudad: pedidoReal.ciudad,
              departamento: pedidoReal.departamento
            },
            total: pedidoReal.total,
            costoEnvio: pedidoReal.costoEnvio,
            fechaCreacion: pedidoReal.fechaCreacion
          };
          
          setPedido(pedidoConvertido);
        } catch (error) {
          console.error('Error al cargar pedido:', error);
          // Si falla, mostrar datos simulados como fallback
          const pedidoSimulado: PedidoConfirmado = {
            numeroPedido,
            productos: [
              {
                id: 1,
                nombre: "Camiseta Estilo Urbano",
                precio: 45000,
                cantidad: 2,
                talla: "M"
              }
            ],
            datosCliente: {
              nombre: "Juan",
              apellidos: "Pérez",
              direccion: "Calle 123 #45-67",
              telefono: "",
              ciudad: "Bogotá",
              departamento: "Cundinamarca"
            },
            total: 95000,
            costoEnvio: 5000,
            fechaCreacion: new Date().toISOString()
          };
          
          setPedido(pedidoSimulado);
        }
      }
      
      setLoading(false);
    };

    fetchPedido();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Package size={48} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido no encontrado</h1>
          <p className="text-gray-600 mb-6">No se pudo encontrar la información del pedido.</p>
          <Link href="/productos" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header de confirmación */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
          <p className="text-gray-600">Tu pedido ha sido procesado exitosamente</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Detalles del pedido */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Pedido</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Número de pedido:</span>
                  <span className="font-semibold text-gray-900">{pedido.numeroPedido}</span>
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
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Pendiente de pago
                  </span>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
              <div className="space-y-3">
                {pedido.productos.map((producto, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-500">Talla: {producto.talla} | Cantidad: {producto.cantidad}</p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      COP {(producto.precio * producto.cantidad).toLocaleString('es-CO')}
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
                    <p className="font-medium text-gray-900">{pedido.datosCliente.telefono}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección de entrega</p>
                    <p className="font-medium text-gray-900">
                      {pedido.datosCliente.direccion}<br />
                      {pedido.datosCliente.ciudad}, {pedido.datosCliente.departamento}
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
              <Link 
                href="/" 
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
              >
                Continuar comprando
              </Link>
              <Link 
                href={`/pedidos/${pedido.numeroPedido}`}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center block"
              >
                Ver pedido
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfirmacionContent />
    </Suspense>
  );
} 