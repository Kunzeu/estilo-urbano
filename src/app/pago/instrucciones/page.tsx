'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Copy, CheckCircle, ArrowLeft, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Pedido {
  id: number;
  numero: string;
  total: number;
  costoEnvio: number;
  estado: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
}

function InstruccionesPagoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const numeroPedido = searchParams.get('pedido');
  const numeroNequi = '3243118004';
  const titular = 'Estilo Urbano SAS';
  const whatsapp = '3243118004';

  useEffect(() => {
    const cargarPedido = async () => {
      if (!numeroPedido) {
        router.push('/carrito');
        return;
      }

      try {
        // Intentar pedido normal
        let response = await fetch(`/api/pedidos?numero=${numeroPedido}`);
        if (response.ok) {
          const data = await response.json();
          setPedido(data.pedido);
          return;
        }

        // Fallback a pedido personalizado
        response = await fetch(`/api/personalizar?numero=${numeroPedido}`);
        if (response.ok) {
          const data = await response.json();
          setPedido(data.pedido);
          return;
        }

        throw new Error('Pedido no encontrado');
      } catch (error) {
        console.error('Error al cargar pedido:', error);
        router.push('/carrito');
      } finally {
        setLoading(false);
      }
    };

    cargarPedido();
  }, [numeroPedido, router]);

  const copiarAlPortapapeles = async (texto: string, tipo: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(tipo);
      setTimeout(() => setCopiado(null), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  const mensajeWhatsapp = pedido
    ? `Hola, acabo de realizar el pago del pedido ${pedido.numero} por Nequi. Adjunto el comprobante.`
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando instrucciones de pago...</p>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
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
          <h1 className="text-3xl font-bold text-gray-900">Instrucciones de Pago</h1>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Pedido</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Número de pedido:</span>
              <span className="font-medium">{pedido.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">COP {(pedido.total - pedido.costoEnvio).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío:</span>
              <span className="font-medium">COP {pedido.costoEnvio.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-bold">Total a pagar:</span>
              <span className="font-bold text-lg text-green-600">COP {pedido.total.toLocaleString('es-CO')}</span>
            </div>
          </div>
          {/* Mensaje informativo sobre el carrito */}
          <div className="mt-6 mb-2 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-sm">
            Tu carrito se ha vaciado para que puedas iniciar una nueva compra. Si deseas agregar más productos, simplemente vuelve a la tienda.
          </div>
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos</h3>
            <div className="space-y-2">
              {pedido.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.nombre} (x{item.cantidad})</span>
                  <span>COP {(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pago por Nequi */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">💚</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nequi</h3>
              <p className="text-sm text-gray-600">Pago rápido y seguro</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Número:</span>
                <span className="font-mono font-medium">{numeroNequi}</span>
                <button
                  onClick={() => copiarAlPortapapeles(numeroNequi, 'nequi')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  {copiado === 'nequi' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Titular:</span>
                <span className="font-medium">{titular}</span>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Referencia:</strong> {pedido.numero}
              </p>
            </div>
          </div>
        </div>

        {/* Botón WhatsApp */}
        <div className="mb-8">
          <a
            href={`https://wa.me/57${whatsapp}?text=${encodeURIComponent(mensajeWhatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Enviar comprobante por WhatsApp
            </Button>
          </a>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Instrucciones de Pago</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <p>Realiza el pago por el monto exacto a Nequi.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <p>Usa el número de pedido <strong>{pedido.numero}</strong> como referencia.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <p>Envía el comprobante de pago por WhatsApp al <strong>{whatsapp}</strong>.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">4</span>
              </div>
              <p>Tu pedido será procesado en 24-48 horas después de confirmar el pago.</p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Necesitas ayuda?</h3>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">WhatsApp</p>
              <p className="font-medium text-gray-900">{whatsapp}</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex gap-3">
          <Link href={`/pedidos/${pedido.numero}`}>
            <Button variant="outline" className="flex-1">
              Ver pedido
            </Button>
          </Link>
          <Link href="/productos">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              Seguir comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function InstruccionesPagoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando instrucciones de pago...</p>
        </div>
      </div>
    }>
      <InstruccionesPagoContent />
    </Suspense>
  );
} 