"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
// Imagen no se usa aquí (previews removidos del resumen)
import { Button } from "@/components/ui/button";
import colombiaData from "../../carrito/colombia.min.json";

interface Item {
  talla: string;
  color: string;
  imagenFrente?: string | null;
  imagenEspalda?: string | null;
}

interface PedidoPers {
  numero: string;
  estado: string;
  items: Item[];
  total?: number;
}

function CheckoutPersonalizadoContent() {
  const search = useSearchParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<PedidoPers | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: '', apellidos: '', direccion: '', telefono: '', ciudad: '', departamento: '', metodoPago: 'transferencia' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const numero = search.get("pedido");
    if (!numero) {
      router.push("/personalizar");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/personalizar?numero=${numero}`);
        if (!res.ok) throw new Error("No encontrado");
        const data = await res.json();
        setPedido(data.pedido ? { ...data.pedido } : null);
      } catch {
        router.push("/personalizar");
      } finally {
        setLoading(false);
      }
    })();
  }, [search, router]);

  // Cálculo de envío y selects, igual que carrito
  const tarifasEnvio: { [ciudad: string]: number } = {
    Bogotá: 8000, Medellín: 9000, Cali: 9000, Barranquilla: 10000, Cartagena: 10000, default: 12000,
  };
  const obtenerPrecioEnvio = (ciudad: string) => {
    if (!ciudad) return 0;
    const c = ciudad.trim().toLowerCase();
    for (const k in tarifasEnvio) if (k.toLowerCase() === c) return tarifasEnvio[k];
    return tarifasEnvio.default;
  };
  const departamentosColombia = colombiaData as Array<{ departamento: string; ciudades: string[] }>;
  const listaDepartamentos = departamentosColombia.map(d => d.departamento).sort((a,b)=>a.localeCompare(b));
  const ciudadesActuales = form.departamento ? (departamentosColombia.find(d=>d.departamento===form.departamento)?.ciudades || []) : [];
  const subtotal = pedido ? 40000 * pedido.items.length : 0;
  const costoEnvio = obtenerPrecioEnvio(form.ciudad);
  // total se muestra directamente como subtotal + costoEnvio en el resumen

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>;
  if (!pedido) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Pedido no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto bg-white rounded shadow p-4 sm:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex-1 border-b lg:border-b-0 lg:border-r lg:pr-8 pb-6 lg:pb-0">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Checkout</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-600">*</span></label>
                <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos <span className="text-red-600">*</span></label>
                <input value={form.apellidos} onChange={e=>setForm({...form, apellidos:e.target.value})} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento <span className="text-red-600">*</span></label>
              <select value={form.departamento} onChange={e=>setForm({...form, departamento: e.target.value, ciudad: ''})} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Selecciona un departamento</option>
                {listaDepartamentos.map(dep=> <option key={dep} value={dep}>{dep}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad / Municipio <span className="text-red-600">*</span></label>
              <select value={form.ciudad} onChange={e=>setForm({...form, ciudad: e.target.value})} disabled={!form.departamento} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">{form.departamento ? 'Selecciona una ciudad' : 'Primero selecciona un departamento'}</option>
                {form.departamento && ciudadesActuales.sort((a,b)=>a.localeCompare(b)).map(ciudad=> <option key={ciudad} value={ciudad}>{ciudad}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega <span className="text-red-600">*</span></label>
              <input value={form.direccion} onChange={e=>setForm({...form, direccion:e.target.value})} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-600">*</span></label>
              <input value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
          </div>
          <div className="mt-8 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm0 0V7m0 4v4m0 0c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z" /></svg> Tus datos están protegidos y cifrados.</div>
            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Garantía de satisfacción 100%.</div>
            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg> Envío rápido y seguro a todo el país.</div>
          </div>
        </div>

        <div className="w-full lg:w-[350px] flex-shrink-0 lg:pl-8 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l">
          <h4 className="text-lg font-bold mb-4">Resumen de tu personalización</h4>
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
            <div className="space-y-3 mb-4">
              {pedido.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-3 border-b pb-3 last:border-b-0">
                  <div className="w-12 h-12 rounded-lg border" style={{ background: it.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">Camiseta personalizada</div>
                    <div className="text-xs text-gray-500">Talla: {it.talla}</div>
                  </div>
                  <div className="font-semibold text-gray-700 text-sm sm:text-base">COP 40.000</div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">COP {subtotal.toLocaleString('es-CO')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Envío a {form.ciudad || 'seleccionar ciudad'}</span><span className="font-medium">{form.ciudad ? `COP ${costoEnvio.toLocaleString('es-CO')}` : '-'}</span></div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total a pagar</span>
                  <span className="text-green-600">COP {(subtotal + costoEnvio).toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={guardando}
              onClick={async ()=>{
                if(!form.nombre||!form.apellidos||!form.direccion||!form.telefono||!form.ciudad||!form.departamento){setError('Completa todos los campos');return;}
                setError(null);
                setGuardando(true);
                await fetch('/api/personalizar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numero: pedido.numero, datosCliente: form, metodoPago: 'transferencia', costoEnvio }) });
                router.push(`/pago/instrucciones?pedido=${pedido.numero}`);
              }}
            >
              Pagar con Nequi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPersonalizadoPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CheckoutPersonalizadoContent />
    </Suspense>
  );
}


