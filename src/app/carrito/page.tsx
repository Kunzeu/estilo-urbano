"use client";
import { ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { useState, useEffect } from "react";
import colombiaData from "./colombia.min.json";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function CarritoPage() {
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity, updateTalla } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    nombre: "", 
    apellidos: "", 
    direccion: "", 
    telefono: "", 
    tipoEnvio: 'envio', 
    ciudad: '', 
    departamento: '',
    metodoPago: 'transferencia' // Solo transferencia bancaria (PSE)
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<{ [id: number]: string[] }>({});
  const [loadingTallas, setLoadingTallas] = useState(false);

  useEffect(() => {
    // Obtener tallas disponibles para cada producto en el carrito
    const fetchTallas = async () => {
      if (cart.length === 0) return;
      
      setLoadingTallas(true);
      try {
        const ids = Array.from(new Set(cart.map(item => item.id)));
        const tallasPorId: { [id: number]: string[] } = {};
        
        for (const id of ids) {
          try {
            const res = await fetch(`/api/productos/${id}`);
            if (res.ok) {
              const prod = await res.json();
              tallasPorId[id] = JSON.parse(prod.tallas || "[]");
            } else {
              console.error(`Error al obtener producto ${id}:`, res.status);
            }
          } catch (error) {
            console.error(`Error al obtener producto ${id}:`, error);
          }
        }
        setProductos(tallasPorId);
      } catch (error) {
        console.error("Error al cargar tallas:", error);
      } finally {
        setLoadingTallas(false);
      }
    };
    
    fetchTallas();
  }, [cart]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    
    // Validaciones básicas
    if (!form.nombre || !form.apellidos || !form.direccion || !form.telefono || !form.ciudad || !form.departamento) {
      setFormError("Por favor completa todos los campos requeridos");
      return;
    }

    if (cart.length === 0) {
      setFormError("El carrito está vacío");
      return;
    }

    setLoading(true);

    try {
      // Calcular totales
      const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
      const costoEnvio = obtenerPrecioEnvio(form.ciudad);
      const total = subtotal + costoEnvio;

      // Preparar datos del pedido
      const datosPedido = {
        productos: cart,
        datosCliente: {
          nombre: form.nombre,
          apellidos: form.apellidos,
          direccion: form.direccion,
          telefono: form.telefono,
          ciudad: form.ciudad,
          departamento: form.departamento
        },
        total,
        costoEnvio,
        metodoPago: form.metodoPago, // Usar el método de pago seleccionado
        email: session?.user?.email || '' // Incluir email del usuario
      };

      // Enviar pedido a la API
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosPedido),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar el pago');
      }

      // Pedido creado exitosamente, redirigir a instrucciones de pago
      clearCart();
      setShowForm(false);
      setForm({ nombre: "", apellidos: "", direccion: "", telefono: "", tipoEnvio: 'envio', ciudad: '', departamento: '', metodoPago: 'transferencia' });
      
      // Redirigir a las instrucciones de pago
      router.push(`/pago/instrucciones?pedido=${result.numeroPedido}`);

    } catch (error) {
      console.error('Error al procesar pago:', error);
      setFormError(error instanceof Error ? error.message : 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  }

  // Tabla de tarifas de envío por ciudad
  const tarifasEnvio: { [ciudad: string]: number } = {
    "Bogotá": 8000,
    "Medellín": 9000,
    "Cali": 9000,
    "Barranquilla": 10000,
    "Cartagena": 10000,
    // Puedes agregar más ciudades aquí
    "default": 12000 // Resto del país
  };

  function obtenerPrecioEnvio(ciudad: string) {
    if (!ciudad) return 0;
    const ciudadNormalizada = ciudad.trim().toLowerCase();
    // Buscar coincidencia exacta (ignorando mayúsculas/minúsculas)
    for (const key in tarifasEnvio) {
      if (key.toLowerCase() === ciudadNormalizada) {
        return tarifasEnvio[key];
      }
    }
    return tarifasEnvio["default"];
  }

  // Procesar departamentos y municipios desde el JSON
  const departamentosColombia = (colombiaData as Array<{departamento: string, ciudades: string[]}>);
  const listaDepartamentos = departamentosColombia.map(d => d.departamento).sort((a, b) => a.localeCompare(b));

  if (cart.length === 0 && !showForm && !formSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-6">Parece que aún no has añadido ningún producto a tu carrito.</p>
        <Link href="/productos">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Continuar Comprando</Button>
        </Link>
      </div>
    );
  }

  if (showForm && !formSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded shadow p-0 md:p-8 flex flex-col md:flex-row gap-0 md:gap-8">
          {/* Columna izquierda: Formulario */}
          <div className="flex-1 border-b md:border-b-0 md:border-r md:pr-8 pb-8 md:pb-0">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Checkout</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-600">*</span></label>
                <input name="nombre" type="text" placeholder="Nombres" value={form.nombre} onChange={handleInput} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos <span className="text-red-600">*</span></label>
                <input name="apellidos" type="text" placeholder="Apellidos" value={form.apellidos} onChange={handleInput} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento <span className="text-red-600">*</span></label>
                <select
                  name="departamento"
                  value={form.departamento}
                  onChange={e => setForm({ ...form, departamento: e.target.value, ciudad: "" })}
                  className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecciona un departamento</option>
                  {listaDepartamentos.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad / Municipio <span className="text-red-600">*</span></label>
                <select
                  name="ciudad"
                  value={form.ciudad}
                  onChange={e => setForm({ ...form, ciudad: e.target.value })}
                  className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!form.departamento}
                >
                  <option value="">{form.departamento ? "Selecciona una ciudad" : "Primero selecciona un departamento"}</option>
                  {form.departamento && departamentosColombia.find(d => d.departamento === form.departamento)?.ciudades.sort((a, b) => a.localeCompare(b)).map(ciudad => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega <span className="text-red-600">*</span></label>
                <input name="direccion" type="text" placeholder="Dirección completa" value={form.direccion} onChange={handleInput} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-600">*</span></label>
                <input name="telefono" type="tel" placeholder="Número de teléfono" value={form.telefono} onChange={handleInput} className="border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>

              {/* Opciones de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Método de pago <span className="text-red-600">*</span></label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transferencia"
                      checked={form.metodoPago === 'transferencia'}
                      onChange={handleInput}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">🏦</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Transferencia bancaria (PSE)</div>
                        <div className="text-sm text-gray-500">Paga de forma segura por PSE</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-fade-in">{formError}</div>
              )}
              <div className="flex gap-3 mt-6">
                <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white flex-1" disabled={loading}>
                  {loading ? "Procesando pago..." : "Pagar con PSE"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={loading} className="flex-1">
                  Volver al carrito
                </Button>
              </div>
            </form>
            {/* Mensajes de confianza */}
            <div className="mt-8 space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm0 0V7m0 4v4m0 0c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z" /></svg> Tus datos están protegidos y cifrados.</div>
              <div className="flex items-center gap-2"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Garantía de satisfacción 100%.</div>
              <div className="flex items-center gap-2"><svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg> Envío rápido y seguro a todo el país.</div>
            </div>
          </div>
          {/* Columna derecha: Resumen del carrito */}
          <div className="w-full md:w-[350px] flex-shrink-0 md:pl-8 pt-8 md:pt-0 border-t md:border-t-0 md:border-l">
            <h4 className="text-lg font-bold mb-4">Resumen de tu compra</h4>
            {/* Resumen del pedido */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
              
              {/* Productos */}
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={`${item.id}-${item.talla}`} className="flex items-center gap-3 border-b pb-3 last:border-b-0">
                    {item.imagen && <Image src={item.imagen} alt={item.nombre} width={48} height={48} className="rounded-lg border object-cover" />}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.nombre}</div>
                      <div className="text-xs text-gray-500">Talla: {item.talla} | Cantidad: {item.cantidad}</div>
                    </div>
                    <div className="font-semibold text-gray-700">COP {item.precio.toLocaleString("es-CO")}</div>
                    <button onClick={() => removeFromCart(item.id, item.talla)} className="ml-2 text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors" title="Eliminar producto">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.length} producto{cart.length !== 1 ? 's' : ''})</span>
                  <span className="font-medium">COP {total.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío a {form.ciudad || 'seleccionar ciudad'}</span>
                  <span className="font-medium">
                    {form.ciudad ? `COP ${obtenerPrecioEnvio(form.ciudad).toLocaleString("es-CO")}` : '-'}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total a pagar</span>
                    <span className="text-green-600">
                      COP {(total + obtenerPrecioEnvio(form.ciudad)).toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Método de pago seleccionado */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">🏦</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Transferencia bancaria (PSE)</div>
                    <div className="text-xs text-gray-500">Paga de forma segura por PSE</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm0 0V7m0 4v4m0 0c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z" /></svg>
              Pago seguro - SSL Encriptado
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        {!showForm && !formSuccess && (
          <>
            <h2 className="text-2xl font-bold mb-6">Tu Carrito</h2>
            <table className="w-full mb-6">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 px-2 font-semibold">Producto</th>
                  <th className="py-3 px-2 font-semibold text-center">Talla</th>
                  <th className="py-3 px-2 font-semibold text-center">Cantidad</th>
                  <th className="py-3 px-2 font-semibold text-right">Precio</th>
                  <th className="py-3 px-2 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={`${item.id}-${item.talla}`} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        {item.imagen && (
                          <Image 
                            src={item.imagen} 
                            alt={item.nombre} 
                            width={60} 
                            height={60} 
                            className="rounded-lg border object-cover" 
                          />
                        )}
                        <span className="font-medium">{item.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <select
                        className="border rounded px-3 py-1 text-sm bg-white"
                        value={item.talla}
                        disabled={loadingTallas}
                        onChange={e => {
                          const nuevaTalla = e.target.value;
                          // Si ya existe ese producto con la nueva talla, sumar cantidades y eliminar duplicado
                          const existente = cart.find(p => p.id === item.id && p.talla === nuevaTalla);
                          if (existente) {
                            increaseQuantity(item.id, nuevaTalla);
                            removeFromCart(item.id, item.talla);
                          } else {
                            // Cambiar la talla del ítem
                            updateTalla(item.id, item.talla, nuevaTalla);
                          }
                        }}
                      >
                        {loadingTallas ? (
                          <option>Cargando...</option>
                        ) : (
                          (productos[item.id] || [item.talla]).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))
                        )}
                      </select>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => decreaseQuantity(item.id, item.talla)} 
                          className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 text-lg font-bold flex items-center justify-center transition-colors" 
                          disabled={item.cantidad <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.cantidad}</span>
                        <button 
                          onClick={() => increaseQuantity(item.id, item.talla)} 
                          className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 text-lg font-bold flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      COP {item.precio.toLocaleString("es-CO")}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button 
                        onClick={() => removeFromCart(item.id, item.talla)} 
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t pt-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-gray-900">COP {total.toLocaleString("es-CO")}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={clearCart}
                className="flex-1"
              >
                Vaciar carrito
              </Button>
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white flex-1" 
                onClick={() => setShowForm(true)}
              >
                Finalizar compra
              </Button>
            </div>
          </>
        )}
        {formSuccess && (
          <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">{formSuccess}</h3>
              <p className="text-gray-600 mb-6">Gracias por tu compra. Te contactaremos pronto para coordinar la entrega.</p>
              <Link href="/productos">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Seguir comprando
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 