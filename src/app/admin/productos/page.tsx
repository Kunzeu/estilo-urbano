"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Edit, Trash2, Save, X, Plus } from "lucide-react";
import Image from "next/image";

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  public_id?: string;
  tallas: string;
}

interface UserWithRol {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  rol?: string;
}

export default function ProductosAdminPage() {
  const { data: session, status } = useSession();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [editandoProducto, setEditandoProducto] = useState<Producto | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  // Cambiar el estado de nuevoProducto para que precio sea string
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
    public_id: "",
    tallas: "[]"
  });
  const [tallasDisponibles] = useState<string[]>(["XS", "S", "M", "L", "XL", "XXL"]);
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<string[]>([]);
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null);

  // Estado para el modal de imagen
  const [modalImagen, setModalImagen] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ((session?.user as UserWithRol)?.rol !== "admin") return;
    fetch("/api/productos").then(r => r.json()).then(setProductos).finally(() => setLoading(false));
  }, [session]);

  if (status === "loading") return <div className="p-8">Cargando...</div>;
  if (!session || (session.user as UserWithRol)?.rol !== "admin") return <div className="p-8 text-red-600">Acceso denegado</div>;

  function iniciarEdicion(producto: Producto) {
    setEditando(producto.id);
    setEditandoProducto({ ...producto });
  }

  function cancelarEdicion() {
    setEditando(null);
    setEditandoProducto(null);
  }

  async function guardarEdicion() {
    if (!editandoProducto) return;
    setLoadingAction(true);
    setError("");
    setSuccess("");
    
    const res = await fetch(`/api/productos/${editandoProducto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editandoProducto)
    });

    if (res.ok) {
      setProductos(productos.map(p => p.id === editandoProducto.id ? editandoProducto : p));
      setEditando(null);
      setEditandoProducto(null);
      showSuccess("¡Producto actualizado!");
    } else {
      const data = await res.json();
      setError(data.error || "Error al actualizar producto");
      showError(data.error || "Error al actualizar producto");
    }
    setLoadingAction(false);
  }

  async function eliminarProducto(id: number) {
    setLoadingAction(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProductos(productos.filter(p => p.id !== id));
      setEliminando(null);
      showSuccess("Producto eliminado correctamente");
    } else {
      const data = await res.json();
      setError(data.error || "Error al eliminar producto");
      showError(data.error || "Error al eliminar producto");
    }
    setLoadingAction(false);
  }

  async function crearProducto(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoadingAction(true);
    
    const productoConTallas = {
      ...nuevoProducto,
      precio: parseInt(nuevoProducto.precio.replace(/\./g, ""), 10),
      tallas: JSON.stringify(tallasSeleccionadas)
    };
    
    // 1. Crear producto sin imagen
    const res = await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productoConTallas)
    });

    if (res.ok) {
      let producto = await res.json();
      // 2. Si hay imagen, subirla y actualizar producto
      if (imagenArchivo) {
        const formData = new FormData();
        formData.append("file", imagenArchivo);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await uploadRes.json();
        if (data.url && data.public_id) {
          // Actualizar producto con la imagen
          const updateRes = await fetch(`/api/productos/${producto.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imagen: data.url, public_id: data.public_id }),
          });
          if (updateRes.ok) {
            producto = await updateRes.json();
          }
        }
      }
      setProductos([producto, ...productos]);
      setNuevoProducto({ nombre: "", descripcion: "", precio: "", imagen: "", public_id: "", tallas: "[]" });
      setImagenArchivo(null);
      setTallasSeleccionadas([]);
      setMostrarFormulario(false);
      showSuccess("¡Producto creado exitosamente!");
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear producto");
      showError(data.error || "Error al crear producto");
    }
    setLoadingAction(false);
  }

  function agregarTalla() {
    const tallas = JSON.parse(editandoProducto?.tallas || "[]");
    const nuevaTalla = prompt("Ingrese la nueva talla:");
    if (nuevaTalla && editandoProducto) {
      const nuevasTallas = [...tallas, nuevaTalla];
      setEditandoProducto({ ...editandoProducto, tallas: JSON.stringify(nuevasTallas) });
    }
  }

  function eliminarTalla(talla: string) {
    if (!editandoProducto) return;
    const tallas = JSON.parse(editandoProducto.tallas);
    const nuevasTallas = tallas.filter((t: string) => t !== talla);
    setEditandoProducto({ ...editandoProducto, tallas: JSON.stringify(nuevasTallas) });
  }

  function toggleTallaEnEdicion(talla: string) {
    if (!editandoProducto) return;
    const tallas = JSON.parse(editandoProducto.tallas);
    if (tallas.includes(talla)) {
      const nuevasTallas = tallas.filter((t: string) => t !== talla);
      setEditandoProducto({ ...editandoProducto, tallas: JSON.stringify(nuevasTallas) });
    } else {
      const nuevasTallas = [...tallas, talla];
      setEditandoProducto({ ...editandoProducto, tallas: JSON.stringify(nuevasTallas) });
    }
  }

  function showSuccess(msg: string) {
    setSuccess(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSuccess(""), 3000);
  }
  function showError(msg: string) {
    setError(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setError(""), 4000);
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Panel de Productos</h2>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 animate-fade-in">{success}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade-in">{error}</div>}

      {/* Formulario para crear nuevo producto */}
      {mostrarFormulario && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded shadow mb-8">
          <h3 className="font-semibold text-lg mb-4">Crear nuevo producto</h3>
          <form onSubmit={crearProducto} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={nuevoProducto.nombre}
                onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9.]*"
                placeholder="Precio"
                value={nuevoProducto.precio}
                onChange={e => {
                  // Solo permitir números y puntos
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  setNuevoProducto({ ...nuevoProducto, precio: value });
                }}
                className="border rounded px-3 py-2"
                required
              />
            </div>
            <textarea
              placeholder="Descripción"
              value={nuevoProducto.descripcion}
              onChange={e => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
              className="border rounded px-3 py-2 w-full"
              rows={3}
            />
            
            {/* Carga de imagen */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Imagen del producto</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setImagenArchivo(file);
                        setNuevoProducto({ ...nuevoProducto, imagen: "", public_id: "" });
                        alert("Imagen seleccionada, se subirá al crear el producto");
                      }
                    };
                    input.click();
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Seleccionar imagen desde PC
                </button>
                {nuevoProducto.imagen && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">✓ Imagen seleccionada</span>
                    <button
                      type="button"
                      onClick={() => setNuevoProducto({ ...nuevoProducto, imagen: "", public_id: "" })}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>
              {nuevoProducto.imagen && (
                <div className="mt-2">
                  <Image 
                    src={nuevoProducto.imagen} 
                    alt="Vista previa" 
                    width={320} height={320}
                    className="w-80 h-80 object-cover rounded-lg border-2 border-gray-200 shadow-lg cursor-pointer"
                    onClick={() => setModalImagen(nuevoProducto.imagen || null)}
                  />
                </div>
              )}
            </div>

            {/* Selección de tallas */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tallas disponibles</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {tallasDisponibles.map(talla => (
                  <label key={talla} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tallasSeleccionadas.includes(talla)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTallasSeleccionadas([...tallasSeleccionadas, talla]);
                        } else {
                          setTallasSeleccionadas(tallasSeleccionadas.filter(t => t !== talla));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{talla}</span>
                  </label>
                ))}
              </div>
              {tallasSeleccionadas.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Tallas seleccionadas: </span>
                  <span className="text-sm font-medium">{tallasSeleccionadas.join(", ")}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center justify-center min-w-[120px]" disabled={loadingAction}>
                {loadingAction ? <span className="loader mr-2"></span> : null} Crear Producto
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setTallasSeleccionadas([]);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de productos */}
      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map(producto => (
            <div key={producto.id} className="bg-white dark:bg-gray-900 rounded shadow p-4">
              {editando === producto.id ? (
                // Modo edición
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Editando producto</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={guardarEdicion}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition min-w-[100px] justify-center"
                        disabled={loadingAction}
                      >
                        {loadingAction ? <span className="loader mr-2"></span> : <Save size={16} />} Guardar
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition"
                      >
                        <X size={16} /> Cancelar
                      </button>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={editandoProducto?.nombre || ""}
                    onChange={e => setEditandoProducto(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                    className="border rounded px-3 py-2 w-full"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9.]*"
                    placeholder="Precio"
                    value={editandoProducto?.precio || 0}
                    onChange={e => {
                      // Solo permitir números y puntos
                      const value = e.target.value.replace(/[^0-9.]/g, "");
                      setEditandoProducto(prev => prev ? { ...prev, precio: parseFloat(value) } : null);
                    }}
                    className="border rounded px-3 py-2 w-full"
                  />
                  <textarea
                    placeholder="Descripción"
                    value={editandoProducto?.descripcion || ""}
                    onChange={e => setEditandoProducto(prev => prev ? { ...prev, descripcion: e.target.value } : null)}
                    className="border rounded px-3 py-2 w-full"
                    rows={2}
                  />
                                     {/* Carga de imagen en edición */}
                   <div className="space-y-2">
                     <label className="block text-sm font-medium">Imagen del producto</label>
                     <div className="flex items-center gap-4">
                       <button
                         type="button"
                         onClick={async () => {
                           const input = document.createElement('input');
                           input.type = 'file';
                           input.accept = 'image/*';
                           input.onchange = async (e) => {
                             const file = (e.target as HTMLInputElement).files?.[0];
                             if (file && editandoProducto) {
                               const formData = new FormData();
                               formData.append("file", file);
                               const res = await fetch("/api/upload", {
                                 method: "POST",
                                 body: formData,
                               });
                               const data = await res.json();
                               if (data.url && data.public_id) {
                                 setEditandoProducto({ ...editandoProducto, imagen: data.url, public_id: data.public_id });
                                 alert("Imagen subida correctamente");
                               } else {
                                 alert("Error al subir la imagen");
                               }
                             }
                           };
                           input.click();
                         }}
                         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                       >
                         Seleccionar imagen desde PC
                       </button>
                       {editandoProducto?.imagen && (
                         <div className="flex items-center gap-2">
                           <span className="text-sm text-green-600">✓ Imagen seleccionada</span>
                           <button
                             type="button"
                             onClick={() => setEditandoProducto(prev => prev ? { ...prev, imagen: "", public_id: "" } : null)}
                             className="text-red-600 hover:text-red-800 text-sm"
                           >
                             Quitar
                           </button>
                         </div>
                       )}
                     </div>
                     {editandoProducto?.imagen && (
                       <div className="mt-2">
                         <Image 
                           src={editandoProducto.imagen} 
                           alt="Vista previa" 
                           width={320} height={320}
                           className="w-80 h-80 object-cover rounded-lg border-2 border-gray-200 shadow-lg cursor-pointer"
                           onClick={() => setModalImagen(editandoProducto.imagen || null)}
                         />
                       </div>
                     )}
                   </div>
                  
                                     {/* Gestión de tallas */}
                   <div>
                     <label className="block text-sm font-medium mb-2">Tallas disponibles:</label>
                     <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-2">
                       {tallasDisponibles.map(talla => (
                         <label key={talla} className="flex items-center space-x-2 cursor-pointer">
                           <input
                             type="checkbox"
                             checked={JSON.parse(editandoProducto?.tallas || "[]").includes(talla)}
                             onChange={() => toggleTallaEnEdicion(talla)}
                             className="rounded"
                           />
                           <span className="text-sm">{talla}</span>
                         </label>
                       ))}
                     </div>
                     <div className="flex flex-wrap gap-2 mb-2">
                       {JSON.parse(editandoProducto?.tallas || "[]").map((talla: string) => (
                         <span key={talla} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                           {talla}
                           <button
                             onClick={() => eliminarTalla(talla)}
                             className="text-red-600 hover:text-red-800"
                           >
                             ×
                           </button>
                         </span>
                       ))}
                     </div>
                     <button
                       type="button"
                       onClick={agregarTalla}
                       className="text-sm text-blue-600 hover:text-blue-800"
                     >
                       + Agregar talla personalizada
                     </button>
                   </div>
                </div>
              ) : (
                // Modo visualización
                                 <div>
                   {producto.imagen && (
                     <div className="flex justify-center mb-3">
                       <Image 
                         src={producto.imagen} 
                         alt={producto.nombre} 
                         width={320} 
                         height={320} 
                         className="w-80 h-80 object-cover rounded-lg border-2 border-gray-200 shadow-lg cursor-pointer" 
                         onClick={() => setModalImagen(producto.imagen || null)}
                       />
                     </div>
                   )}
                   <h3 className="font-bold text-lg mb-2">{producto.nombre}</h3>
                  <p className="text-gray-600 mb-2">COP {producto.precio.toLocaleString("es-CO", {minimumFractionDigits:2})}</p>
                  {producto.descripcion && <p className="text-sm text-gray-500 mb-3">{producto.descripcion}</p>}
                  
                  <div className="mb-3">
                    <span className="text-sm font-medium">Tallas: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {JSON.parse(producto.tallas || "[]").map((talla: string) => (
                        <span key={talla} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          {talla}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => iniciarEdicion(producto)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      onClick={() => setEliminando(producto.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition min-w-[100px] justify-center"
                      disabled={loadingAction}
                    >
                      {loadingAction ? <span className="loader mr-2"></span> : <Trash2 size={16} />} Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {eliminando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEliminando(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarProducto(eliminando)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imagen */}
      {modalImagen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[200]" onClick={() => setModalImagen(null)}>
          <Image src={modalImagen!} alt="Imagen grande" width={800} height={800} className="max-w-2xl max-h-[90vh] rounded-lg shadow-2xl border-4 border-white object-contain" />
        </div>
      )}
    </div>
  );
} 