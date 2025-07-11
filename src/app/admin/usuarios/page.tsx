"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Edit, Trash2, Save, X } from "lucide-react";

interface User {
  id: number;
  nombre?: string;
  email: string;
  rol: string;
}

interface UserWithRol {
  name?: string | null;
  nombre?: string | null;
  email?: string | null;
  image?: string | null;
  rol?: string;
}

export default function UsuariosAdminPage() {
  const { data: session, status } = useSession();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState({ nombre: "", email: "", password: "", rol: "user" });
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [editandoUsuario, setEditandoUsuario] = useState<User | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);

  useEffect(() => {
    if ((session?.user as UserWithRol)?.rol !== "admin") return;
    fetch("/api/usuarios").then(r => r.json()).then(setUsuarios).finally(() => setLoading(false));
  }, [session]);

  if (status === "loading") return <div className="p-8">Cargando...</div>;
  if (!session || (session.user as UserWithRol)?.rol !== "admin") return <div className="p-8 text-red-600">Acceso denegado</div>;

  async function cambiarRol(id: number, rol: string) {
    await fetch(`/api/usuarios/${id}/rol`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rol }) });
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol } : u));
  }

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault();
    setCreando(true);
    setError("");
    const res = await fetch("/api/usuarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nuevo) });
    if (res.ok) {
      const user = await res.json();
      setUsuarios([...usuarios, user]);
      setNuevo({ nombre: "", email: "", password: "", rol: "user" });
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear usuario");
    }
    setCreando(false);
  }

  function iniciarEdicion(usuario: User) {
    setEditando(usuario.id);
    setEditandoUsuario({ ...usuario });
  }

  function cancelarEdicion() {
    setEditando(null);
    setEditandoUsuario(null);
  }

  async function guardarEdicion() {
    if (!editandoUsuario) return;
    
    const res = await fetch(`/api/usuarios/${editandoUsuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: editandoUsuario.nombre,
        email: editandoUsuario.email,
        rol: editandoUsuario.rol
      })
    });

    if (res.ok) {
      setUsuarios(usuarios.map(u => u.id === editandoUsuario.id ? editandoUsuario : u));
      setEditando(null);
      setEditandoUsuario(null);
    } else {
      const data = await res.json();
      setError(data.error || "Error al actualizar usuario");
    }
  }

  async function eliminarUsuario(id: number) {
    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsuarios(usuarios.filter(u => u.id !== id));
      setEliminando(null);
    } else {
      const data = await res.json();
      setError(data.error || "Error al eliminar usuario");
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Panel de Usuarios</h2>
      <form onSubmit={crearUsuario} className="bg-white dark:bg-gray-900 p-6 rounded shadow flex flex-col gap-4 mb-8">
        <h3 className="font-semibold text-lg mb-2">Crear nuevo usuario</h3>
        <input type="text" placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} className="border rounded px-3 py-2" />
        <input type="email" placeholder="Email" value={nuevo.email} onChange={e => setNuevo({ ...nuevo, email: e.target.value })} className="border rounded px-3 py-2" />
        <input type="password" placeholder="Contraseña" value={nuevo.password} onChange={e => setNuevo({ ...nuevo, password: e.target.value })} className="border rounded px-3 py-2" />
        <select value={nuevo.rol} onChange={e => setNuevo({ ...nuevo, rol: e.target.value })} className="border rounded px-3 py-2">
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
        {error && <span className="text-red-600 text-sm">{error}</span>}
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition" disabled={creando}>Crear usuario</button>
      </form>
      
      <h3 className="font-semibold text-lg mb-4">Usuarios registrados</h3>
      {loading ? <p>Cargando usuarios...</p> : (
        <div className="space-y-4">
          {usuarios.map(u => (
            <div key={u.id} className="border rounded p-4 bg-white dark:bg-gray-900">
              {editando === u.id ? (
                // Modo edición
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Editando usuario</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={guardarEdicion}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                      >
                        <Save size={16} /> Guardar
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition"
                      >
                        <X size={16} /> Cancelar
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={editandoUsuario?.nombre || ""}
                      onChange={e => setEditandoUsuario(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editandoUsuario?.email || ""}
                      onChange={e => setEditandoUsuario(prev => prev ? { ...prev, email: e.target.value } : null)}
                      className="border rounded px-3 py-2"
                    />
                    <select
                      value={editandoUsuario?.rol || "user"}
                      onChange={e => setEditandoUsuario(prev => prev ? { ...prev, rol: e.target.value } : null)}
                      className="border rounded px-3 py-2"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
              ) : (
                // Modo visualización
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-lg">{u.nombre || u.email}</div>
                    <div className="text-gray-500 text-sm">{u.email}</div>
                    <div className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium mt-1">
                      {u.rol === "admin" ? "Administrador" : "Usuario"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={u.rol}
                      onChange={e => cambiarRol(u.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <button
                      onClick={() => iniciarEdicion(u)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      onClick={() => setEliminando(u.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                    >
                      <Trash2 size={16} /> Eliminar
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
              ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEliminando(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarUsuario(eliminando)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 