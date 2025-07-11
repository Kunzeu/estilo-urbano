'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Pedido {
  id: number;
  numero: string;
  total: number;
  estado: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
}

function PagoPSEContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [estadoPago, setEstadoPago] = useState<'pendiente' | 'procesando' | 'exitoso' | 'fallido'>('pendiente');
  const [tiempoRestante, setTiempoRestante] = useState(30);
  const [loading, setLoading] = useState(true);

  const numeroPedido = searchParams.get('pedido');

  useEffect(() => {
    const cargarPedido = async () => {
      if (!numeroPedido) {
        router.push('/carrito');
        return;
      }

      try {
        const response = await fetch(`/api/pedidos?numero=${numeroPedido}`);
        if (!response.ok) {
          throw new Error('Pedido no encontrado');
        }

        const data = await response.json();
        setPedido(data.pedido);
      } catch (error) {
        console.error('Error al cargar pedido:', error);
        router.push('/carrito');
      } finally {
        setLoading(false);
      }
    };

    cargarPedido();
  }, [numeroPedido, router]);

  const simularConfirmacionBanco = useCallback(async () => {
    if (!pedido) return;

    try {
      // Simular respuesta exitosa del banco (80% de éxito)
      const pagoExitoso = Math.random() > 0.2;
      
      const response = await fetch('/api/pedidos/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroPedido: pedido.numero,
          estadoPago: pagoExitoso ? 'exitoso' : 'fallido'
        })
      });

      if (response.ok) {
        setEstadoPago(pagoExitoso ? 'exitoso' : 'fallido');
        
        // Si el pago fue exitoso, redirigir a confirmación después de 3 segundos
        if (pagoExitoso) {
          setTimeout(() => {
            router.push(`/carrito/confirmacion?pedido=${pedido.numero}`);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error al confirmar pago:', error);
      setEstadoPago('fallido');
    }
  }, [pedido, router]);

  useEffect(() => {
    if (estadoPago === 'procesando' && tiempoRestante > 0) {
      const timer = setTimeout(() => {
        setTiempoRestante(tiempoRestante - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (estadoPago === 'procesando' && tiempoRestante === 0) {
      // Simular confirmación del banco
      simularConfirmacionBanco();
    }
  }, [estadoPago, tiempoRestante, simularConfirmacionBanco]);

  const iniciarPago = async () => {
    if (!pedido) return;

    setEstadoPago('procesando');
    setTiempoRestante(30);

    try {
      // Simular inicio de pago PSE
      await fetch('/api/pedidos/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroPedido: pedido.numero,
          estadoPago: 'pendiente'
        })
      });
    } catch (error) {
      console.error('Error al iniciar pago:', error);
    }
  };

  const reintentarPago = () => {
    setEstadoPago('pendiente');
    setTiempoRestante(30);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información de pago...</p>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <XCircle size={48} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido no encontrado</h1>
          <p className="text-gray-600 mb-6">No se pudo encontrar la información del pedido.</p>
          <button 
            onClick={() => router.back()} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Pago PSE</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Estado del pago */}
          <div className="text-center mb-8">
            {estadoPago === 'pendiente' && (
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pago PSE</h2>
                <p className="text-gray-600">Transferencia bancaria segura</p>
              </div>
            )}

            {estadoPago === 'procesando' && (
              <div>
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Procesando pago</h2>
                <p className="text-gray-600">Esperando confirmación del banco...</p>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-blue-600">{tiempoRestante}s</div>
                  <div className="text-sm text-gray-500">Tiempo restante</div>
                </div>
              </div>
            )}

            {estadoPago === 'exitoso' && (
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">¡Pago exitoso!</h2>
                <p className="text-gray-600">Tu pago ha sido confirmado</p>
              </div>
            )}

            {estadoPago === 'fallido' && (
              <div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-700 mb-2">Pago fallido</h2>
                <p className="text-gray-600">No se pudo procesar el pago</p>
              </div>
            )}
          </div>

          {/* Información del pedido */}
          <div className="border-t pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Número de pedido:</span>
                <span className="font-medium">{pedido.numero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total a pagar:</span>
                <span className="font-bold text-lg">COP {pedido.total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="border-t pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
            <div className="space-y-2">
              {pedido.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.nombre} (x{item.cantidad})</span>
                  <span>COP {(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="border-t pt-6">
            {estadoPago === 'pendiente' && (
              <Button 
                onClick={iniciarPago}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Iniciar pago PSE
              </Button>
            )}

            {estadoPago === 'fallido' && (
              <div className="space-y-3">
                <Button 
                  onClick={reintentarPago}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Reintentar pago
                </Button>
                <Link href="/carrito">
                  <Button variant="outline" className="w-full">
                    Volver al carrito
                  </Button>
                </Link>
              </div>
            )}

            {estadoPago === 'exitoso' && (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-4">
                  Redirigiendo a la página de confirmación...
                </p>
                <Link href={`/pedidos/${pedido.numero}`}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Ver pedido
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagoPSEPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información de pago...</p>
        </div>
      </div>
    }>
      <PagoPSEContent />
    </Suspense>
  );
} 